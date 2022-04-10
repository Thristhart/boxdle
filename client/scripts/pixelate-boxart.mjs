import nodeCanvas from "canvas";
import FastAverageColor from "fast-average-color";
import { access, readdir, rm, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const { createCanvas, loadImage } = nodeCanvas;

const getColorForImageDataCoord = (x, y, imageData) => {
    const redIndex = y * (imageData.width * 4) + x * 4;
    return [
        imageData.data[redIndex],
        imageData.data[redIndex + 1],
        imageData.data[redIndex + 2],
        imageData.data[redIndex + 3],
    ];
};

/**
 * at each step, how many pixels wide is the image
 */
const steps = [6, 12, 18, 24, 30];

function pixelate(image, step) {
    const sourceCanvas = createCanvas(image.width, image.height);
    const sourceContext = sourceCanvas.getContext("2d");

    sourceContext.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);

    const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

    const aspectRatio = sourceCanvas.width / sourceCanvas.height;
    const pixelSize = sourceCanvas.width / steps[step];
    const targetWidth = steps[step];
    const targetHeight = Math.ceil(steps[step] / aspectRatio);
    const buckets = Array.from({ length: targetWidth }, () =>
        Array.from({ length: targetHeight }, () => [])
    );

    const outputCanvas = createCanvas(targetWidth, targetHeight);
    const outputContext = outputCanvas.getContext("2d");
    const averageColor = new FastAverageColor();

    for (let x = 0; x < sourceCanvas.width; x++) {
        for (let y = 0; y < sourceCanvas.height; y++) {
            const color = getColorForImageDataCoord(x, y, imageData);
            buckets[Math.floor(x / pixelSize)][Math.floor(y / pixelSize)].push(color);
        }
    }
    buckets.forEach((yBuckets, x) =>
        yBuckets.forEach((bucket, y) => {
            const color = averageColor.getColorFromArray4(bucket.flat(1));
            outputContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
            outputContext.fillRect(x, y, 1, 1);
        })
    );
    return outputCanvas.toBuffer("image/png");
}

const boxartPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "boxart"
);

async function generatePixelatedImages(guid, extension) {
    const image = await loadImage(path.join(boxartPath, `${guid}${extension}`));
    if (extension === ".jpg") {
        const pngCanvas = createCanvas(image.width, image.height);
        pngCanvas.getContext("2d").drawImage(image, 0, 0);
        await writeFile(path.join(boxartPath, `${guid}.png`), pngCanvas.toBuffer("image/png"));
        await rm(path.join(boxartPath, `${guid}.jpg`));
    }
    for (let i = 0; i < steps.length; i++) {
        const stepPath = path.join(boxartPath, `steps/${guid}-${i}.png`);
        try {
            await access(stepPath);
            return;
        } catch {
            const buffer = pixelate(image, i);
            await writeFile(stepPath, buffer);
        }
    }
}

async function generateAllPixelatedImages() {
    const boxArtFiles = await readdir(boxartPath);
    const generationSteps = boxArtFiles.map(file => {
        const extension = path.extname(file);
        if (extension !== "") {
            return generatePixelatedImages(path.basename(file).replace(extension, ""), extension);
        } else {
            return Promise.resolve();
        }
    });

    await Promise.all(generationSteps);
}
generateAllPixelatedImages();
