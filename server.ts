import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(express.json());

// Set up WebSocket connection upgrade
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  
  if (pathname === '/api/stream') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Automatic FFmpeg installer for zero-human installation on Windows RDP
function ensureFFmpeg() {
  if (process.platform !== 'win32') return;

  const localFFmpeg = path.join(process.cwd(), 'ffmpeg.exe');
  const dirnameFFmpeg = path.join(__dirname, 'ffmpeg.exe');

  if (fs.existsSync(localFFmpeg) || fs.existsSync(dirnameFFmpeg)) {
    console.log('✓ Found local ffmpeg.exe static binary!');
    return;
  }

  console.log('⚙️ FFmpeg executable is missing on Windows!');
  console.log('⚡ Starting automated background download of official static FFmpeg build...');
  
  try {
    const psCommand = `
      $ProgressPreference = 'SilentlyContinue'
      $url = "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v4.4.1/ffmpeg-4.4.1-win-64.zip"
      Write-Host "Downloading ffmpeg.zip from GitHub..."
      Invoke-WebRequest -Uri $url -OutFile "ffmpeg.zip"
      Write-Host "Extracting archive content..."
      Expand-Archive -Path "ffmpeg.zip" -DestinationPath "." -Force
      Write-Host "Cleaning up setup files..."
      Remove-Item "ffmpeg.zip"
      Write-Host "FFmpeg successfully installed and registered!"
    `;
    execSync(`powershell -Command "${psCommand.replace(/\n/g, '; ')}"`, { stdio: 'inherit' });
  } catch (e: any) {
    console.error('⚠️ Failed to auto-download FFmpeg binary via PowerShell:', e.message);
    console.log('Please ensure your RDP has internet access or place ffmpeg.exe manually in this folder.');
  }
}

// WebSocket Server for RTMP Streaming
wss.on('connection', (ws: WebSocket, req) => {
  console.log('Client connected to Live Stream WebSocket');
  
  const urlParams = new URL(req.url || '', `http://${req.headers.host}`).searchParams;
  const streamKey = urlParams.get('streamKey') || '';
  const rtmpUrl = urlParams.get('rtmpUrl') || 'rtmp://a.rtmp.youtube.com/live2';
  const bitrate = urlParams.get('bitrate') || '2500k';
  
  if (!streamKey) {
    ws.send(JSON.stringify({ type: 'error', message: 'Missing Stream Key!' }));
    ws.close();
    return;
  }

  const rtmpDestination = `${rtmpUrl}/${streamKey}`;
  console.log(`Spawning FFmpeg to stream to: ${rtmpUrl}/****`);

  // Use local downloaded ffmpeg if available
  const localFFmpeg = path.join(process.cwd(), 'ffmpeg.exe');
  const dirnameFFmpeg = path.join(__dirname, 'ffmpeg.exe');
  
  let ffmpegPath = 'ffmpeg';
  if (process.platform === 'win32') {
    if (fs.existsSync(localFFmpeg)) {
      ffmpegPath = localFFmpeg;
    } else if (fs.existsSync(dirnameFFmpeg)) {
      ffmpegPath = dirnameFFmpeg;
    }
  }

  console.log(`Resolved FFmpeg executable path: ${ffmpegPath}`);

  // Spawn FFmpeg to stream client WebM chunks directly to YouTube RTMP
  const ffmpeg = spawn(ffmpegPath, [
    '-loglevel', 'info',
    '-i', 'pipe:0',               // Read WebM format from client stream stdin
    '-c:v', 'libx264',           // H264 encoder
    '-preset', 'ultrafast',      // Ultrafast preset for minimum CPU on light RDP
    '-tune', 'zerolatency',      // Optimize for live broadcast zero latency
    '-b:v', bitrate,             // Custom stream video bitrate
    '-maxrate', bitrate,
    '-bufsize', '4000k',
    '-pix_fmt', 'yuv420p',
    '-g', '60',                  // Smooth keyframe intervals (2 seconds at 30FPS)
    '-c:a', 'aac',               // AAC audio codec
    '-b:a', '128k',              // Clear audio stream bitrate
    '-ar', '44100',              // High quality audio rate
    '-f', 'flv',                 // FLV container for RTMP
    rtmpDestination
  ]);

  ffmpeg.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  ffmpeg.stderr.on('data', (data) => {
    const log = data.toString();
    console.log(`FFmpeg log: ${log}`);
    if (log.includes('frame=') || log.includes('fps=')) {
      ws.send(JSON.stringify({ type: 'status', message: log.trim() }));
    }
  });

  ffmpeg.on('error', (err) => {
    console.error('Failed to spawn FFmpeg process:', err);
    ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'FFmpeg executable not found! Make sure ffmpeg.exe is downloaded.' 
    }));
    ws.close();
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
    ws.send(JSON.stringify({ type: 'stopped', message: `Stream closed (code ${code})` }));
    ws.close();
  });

  // Receive binary media recorder chunks from client browser
  ws.on('message', (data, isBinary) => {
    if (isBinary && ffmpeg.stdin.writable) {
      ffmpeg.stdin.write(data);
    }
  });

  ws.on('close', () => {
    console.log('Client closed WebSocket, terminating FFmpeg stream...');
    try {
      ffmpeg.stdin.end();
      ffmpeg.kill('SIGINT');
    } catch (e) {
      // Ignore
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket stream error:', err);
    try {
      ffmpeg.stdin.end();
      ffmpeg.kill('SIGKILL');
    } catch (e) {
      // Ignore
    }
  });
});

// Run automated FFmpeg static installer check
ensureFFmpeg();

// Mount Vite or Serve Static Assets
const PORT = Number(process.env.PORT || 3000);

if (process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist'))) {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fully Packaged Flag Wars Server running in PRODUCTION on http://localhost:${PORT}`);
  });
} else {
  // Mount Vite dynamically in Dev Mode
  import('vite').then((vite) => {
    vite.createServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: 'spa'
    }).then((viteServer) => {
      app.use(viteServer.middlewares);
      
      server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Flag Wars Full-Stack Dev Server running on http://localhost:${PORT}`);
      });
    });
  });
}
