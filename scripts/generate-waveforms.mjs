import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const audioDirectory = join(projectRoot, "public", "media", "audio");
const outputPath = join(projectRoot, "public", "media", "waveforms.json");
const peakCount = 72;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString("utf8") || `${command} exited with ${code}`));
        return;
      }
      resolve(Buffer.concat(stdout));
    });
  });
}

const files = (await readdir(audioDirectory))
  .filter((file) => file.toLowerCase().endsWith(".mp3"))
  .sort((left, right) => left.localeCompare(right, "en"));

const waveformData = {};

for (const file of files) {
  const source = join(audioDirectory, file);
  const [rawSamples, rawDuration] = await Promise.all([
    run("ffmpeg", ["-v", "error", "-i", source, "-ac", "1", "-ar", "8000", "-f", "s16le", "pipe:1"]),
    run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", source]),
  ]);

  const samples = new Int16Array(rawSamples.buffer, rawSamples.byteOffset, Math.floor(rawSamples.byteLength / 2));
  const peaks = Array.from({ length: peakCount }, (_, index) => {
    const start = Math.floor((index * samples.length) / peakCount);
    const end = Math.max(start + 1, Math.floor(((index + 1) * samples.length) / peakCount));
    let peak = 0;

    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      peak = Math.max(peak, Math.abs(samples[sampleIndex] || 0));
    }

    return Math.max(0.04, Number((peak / 32768).toFixed(3)));
  });

  waveformData[`/media/audio/${file}`] = {
    duration: Number(Number.parseFloat(rawDuration.toString("utf8")).toFixed(2)),
    peaks,
  };
}

await writeFile(outputPath, `${JSON.stringify(waveformData)}\n`, "utf8");
console.log(`Generated ${files.length} waveform fingerprints at ${outputPath}`);
