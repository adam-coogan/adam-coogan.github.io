import React, { useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { TensorContainerObject } from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import styled from "styled-components";
import { viridis } from "scale-color-perceptual";
import Layout from "../components/layout";
import Canvas from "../components/canvas";

const canvasDim = 256; // px

const PixelatedCanvas: any = styled(Canvas)`
  // TS hack
  width: ${canvasDim}px;
  height: ${canvasDim}px;
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
`;

/*
 * tf.tidy!
 * Rename stuff: (x0, y0) -> y
 * Improve plotting: maybe use overlapping canvases to render position dots
 */

const nx = 16;
const ny = 16;
const sig = 0.5;
const twoSig2 = tf.tensor(2 * sig ** 2);
const extent = 5;
const resolution = extent / nx;
const xMax = ((nx - 1) * resolution) / 2;
const yMax = ((ny - 1) * resolution) / 2;
const xGrid = tf.linspace(-xMax, xMax, nx);
const yGrid = tf.linspace(-yMax, yMax, ny);
// TS hack
const [X, Y] = (tf.meshgrid(xGrid, yGrid) as unknown) as [
  tf.Tensor2D,
  tf.Tensor2D
];
const sigmaN = 0.1;
// For plotting
const minVal = -3 * sigmaN;
const maxVal = 1 + 3 * sigmaN;

interface SimTensors extends TensorContainerObject {
  x: tf.Tensor2D;
  y: tf.Tensor1D;
}

interface SimArrays {
  x: number[][];
  y: number[];
}

interface Datasets {
  train: tf.data.Dataset<SimTensors>;
  val: tf.data.Dataset<SimTensors>;
  test: tf.data.Dataset<SimTensors>;
}

const disposeOfSimTensors = (simTens: SimTensors) => {
  simTens.x.dispose();
  simTens.y.dispose();
};

const disposeOfDatasets = async (ds: Datasets) => {
  await ds.train.forEachAsync((simTens) => disposeOfSimTensors(simTens));
  await ds.val.forEachAsync((simTens) => disposeOfSimTensors(simTens));
  await ds.test.forEachAsync((simTens) => disposeOfSimTensors(simTens));
};

const simulate = (): SimTensors =>
  tf.tidy(() => {
    const y = tf.randomUniform([2], -extent / 2, extent / 2) as tf.Tensor1D;
    // TODO: stack
    const d2 = tf
      .stack([X, Y])
      .sub(y.reshape([2, 1, 1]))
      .square()
      .sum(0);
    const mu = d2.div(twoSig2).neg().exp() as tf.Tensor2D;
    const noise: tf.Tensor2D = tf.randomNormal([ny, nx], 0, sigmaN);
    return { x: mu.add(noise), y };
  });

// const simulate = () => tf.tidy(simulateHelper);

const simToArrays = async (simTensors: SimTensors): Promise<SimArrays> => {
  const { x: xTen, y: yTen } = simTensors;
  const x = await xTen.array();
  const y = await yTen.array();
  return { x, y };
};

const genDatasets = (nTrain: number, nVal: number, nTest: number): Datasets => {
  console.log("generating datasets...");
  const train = tf.data.array([...Array(nTrain)].map(simulate));
  const val = tf.data.array([...Array(nVal)].map(simulate));
  const test = tf.data.array([...Array(nTest)].map(simulate));
  console.log("...generated datasets");
  return { train, val, test };
};

const getModel = (
  lr: number,
  nHiddenLayers: number = 1,
  hiddenDim: number = 512
) => {
  // Define a model for linear regression.
  const model = tf.sequential();
  model.add(tf.layers.flatten({ inputShape: [ny, nx, 1] }));
  for (let l = 0; l < nHiddenLayers; l += 1) {
    model.add(tf.layers.dense({ units: hiddenDim }));
    model.add(tf.layers.leakyReLU());
  }
  model.add(tf.layers.dense({ units: 2 }));
  model.compile({ loss: "meanSquaredError", optimizer: tf.train.adam(lr) });
  return model;
};

const train = async (
  model: tf.LayersModel,
  dsTrain: tf.data.Dataset<SimTensors>,
  dsVal: tf.data.Dataset<SimTensors>,
  batchSize: number,
  nEpochs: number
) => {
  // Convert to xs, ys
  const xysTrain = dsTrain
    .map((sim: SimTensors) => ({
      xs: sim.x.reshape([ny, nx, 1]),
      ys: sim.y,
    }))
    .batch(batchSize);
  const xysVal = dsVal
    .map((sim: SimTensors) => ({
      xs: sim.x.reshape([ny, nx, 1]),
      ys: sim.y,
    }))
    .batch(batchSize);

  // Set up monitoring
  const metrics = ["loss", "val_loss", "acc", "val_acc"];
  const container = {
    name: "Model Training",
    tab: "Model",
    styles: { height: "1000px" },
  };
  const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

  console.log("starting training");
  await model.fitDataset(xysTrain, {
    epochs: nEpochs,
    validationData: xysVal,
    callbacks: fitCallbacks,
  });
  console.log("done training!");
  return model;
};

const Page = () => {
  console.table(tf.memory());

  const [trainingConfig, setTrainingConfig] = useState({
    nTrain: 800,
    nVal: 100,
    nTest: 100,
    nHiddenLayers: 1,
    hiddenDim: 512,
    batchSize: 16,
    nEpochs: 1,
    lr: 1e-3,
  });

  const [ds, setDS] = useState<Datasets | null>(null);
  const [modelState, setModelState] = useState<{
    model: tf.LayersModel;
    trained: boolean;
  }>({
    model: getModel(
      trainingConfig.lr,
      trainingConfig.nHiddenLayers,
      trainingConfig.hiddenDim
    ),
    trained: false,
  });
  const [testArrs, setTestArrs] = useState<{
    sim: SimArrays;
    yPred: number[] | null;
  } | null>(null);

  const getDatasets = () => {
    let p;
    if (ds) {
      p = disposeOfDatasets(ds);
      console.log("disposed of ds");
    } else {
      p = Promise.resolve();
    }
    p.then(() => {
      setDS(
        genDatasets(
          trainingConfig.nTrain,
          trainingConfig.nVal,
          trainingConfig.nTest
        )
      );
    });
  };

  const runTrain = () => {
    if (ds) {
      train(
        modelState.model,
        ds.train,
        ds.val,
        trainingConfig.batchSize,
        trainingConfig.nEpochs
      ).then((model) => setModelState({ model, trained: true }));
    }
    return null;
  };

  const getTestArrs = () => {
    simToArrays(simulate()).then((simArrs) => {
      setTestArrs({ sim: simArrs, yPred: null });
    });
  };

  const runPredict = () => {
    if (testArrs) {
      tf.tidy(() => {
        const x = tf.tensor(testArrs.sim.x).reshape([1, ny, nx, 1]);
        // TS hack
        const yPredTen = modelState.model.predict(x) as tf.Tensor2D;
        yPredTen.array().then((yPred: number[][]) => {
          setTestArrs({ ...testArrs, yPred: yPred[0] });
        });
      });
    }
  };

  const drawX = (ctx: CanvasRenderingContext2D) => {
    ctx.canvas.width = nx;
    ctx.canvas.height = ny;

    if (testArrs) {
      // Draw image
      const imgData = ctx.getImageData(0, 0, nx, ny);
      for (let i = 0; i < ny; i += 1) {
        for (let j = 0; j < nx; j += 1) {
          const idx = 4 * i * ny + 4 * j;
          const normdVal = (testArrs.sim.x[i][j] - minVal) / (maxVal - minVal);
          const color = viridis(Math.max(0, Math.min(1, normdVal)));
          // Convert hex color to RGB values
          imgData.data[idx + 0] = parseInt(color.slice(1, 3), 16);
          imgData.data[idx + 1] = parseInt(color.slice(3, 5), 16);
          imgData.data[idx + 2] = parseInt(color.slice(5, 7), 16);
          imgData.data[idx + 3] = 255; // opaque
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  };

  const drawY = (ctx: CanvasRenderingContext2D) => {
    ctx.canvas.width = canvasDim;
    ctx.canvas.height = canvasDim;

    if (testArrs) {
      // True position
      {
        const j = Math.round(
          (canvasDim * (testArrs.sim.y[1] + extent / 2)) / extent
        );
        const i = Math.round(
          (canvasDim * (testArrs.sim.y[0] + extent / 2)) / extent
        );
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(i, j, 5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Predicted position
      if (testArrs.yPred) {
        const j = Math.round(
          (canvasDim * (testArrs.yPred[1] + extent / 2)) / extent
        );
        const i = Math.round(
          (canvasDim * (testArrs.yPred[0] + extent / 2)) / extent
        );
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(i, j, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  return (
    <Layout>
      <p>Hello, world!</p>
      <div>
        <button type="submit" onClick={getDatasets}>
          Generate dataset
        </button>
        <button type="submit" onClick={runTrain}>
          Train
        </button>
        <button type="submit" onClick={getTestArrs}>
          Get test datum
        </button>
        <button type="submit" onClick={runPredict}>
          Predict
        </button>
      </div>
      <div style={{ position: "relative" }}>
        <PixelatedCanvas
          ctxName="2d"
          draw={drawX}
          style={{ position: "absolute", top: "0px", bottom: "0px" }}
        />
        <Canvas
          ctxName="2d"
          draw={drawY}
          style={{ position: "absolute", top: "0px", bottom: "0px" }}
        />
      </div>
    </Layout>
  );
};

export default Page;
