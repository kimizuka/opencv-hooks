const notBlackRange = {
  min: [0, 0, 64],
  max: [255, 255, 255],
};

const red1Range = {
  min: [0, 64, 0],
  max: [21, 255, 255],
};

const red2Range = {
  min: [212, 64, 0],
  max: [255, 255, 255],
};

const greenRange = {
  min: [43, 64, 0],
  max: [127, 255, 255],
};

const blueRange = {
  min: [127, 64, 0],
  max: [213, 255, 255],
};

const yellowRange = {
  min: [30, 51, 0],
  max: [43, 255, 255],
};

export function useInRange() {
  return {
    notBlackRange,
    red1Range,
    red2Range,
    greenRange,
    blueRange,
    yellowRange,
  };
}
