import React from "react";

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

async function loadImage(url) {
  return new Promise((resolve) => {
    const testImage = new Image();
    testImage.onerror = () => resolve();
    testImage.onload = function (event) {
      const { width, height } = event?.currentTarget;
      const style = {};
      if (width >= height) {
        style.width = window.innerWidth / 3;
      } else {
        style.height = window.innerHeight / 3;
      }
      const imageComponent = <img style={style} src={url} />;
      resolve(imageComponent);
    };
    testImage.src = url;
  });
}

export default async function (value) {
  if (isValidHttpUrl(value)) {
    return loadImage(value);
  }

  // TODO: return paragraoh with value inside, set styles for element to fit the view
  // return <p>{value}</p>
}
