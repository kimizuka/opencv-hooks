'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type useVideoStreamPreviewGlProps = {
  stream: MediaStream | null;
  width?: number;
  height?: number;
};

const vertexShaderSource = `#version 300 es
  in vec2 a_position;
  in vec2 a_texCoord;
  out vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderSource = `#version 300 es
  precision mediump float;
  in vec2 v_texCoord;
  uniform sampler2D u_texture;
  out vec4 outColor;
  
  void main() {
    outColor = texture(u_texture, v_texCoord);
  }
`;

export function useVideoStreamPreviewGl({
  stream,
  width = 640,
  height = 480,
}: useVideoStreamPreviewGlProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);

  const createShader = useCallback(
    (gl: WebGL2RenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);

      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);

        return null;
      }

      return shader;
    },
    [],
  );

  const initWebGL = useCallback(
    (gl: WebGL2RenderingContext) => {
      const vertexShader = createShader(
        gl,
        gl.VERTEX_SHADER,
        vertexShaderSource,
      );
      const fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource,
      );

      if (!vertexShader || !fragmentShader) return null;

      const program = gl.createProgram();

      if (!program) return null;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
      }

      const vertices = new Float32Array([
        -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0,
      ]);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

      const texture = gl.createTexture();

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      programRef.current = program;
      textureRef.current = texture;

      return program;
    },
    [createShader],
  );

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const gl = canvasRef.current.getContext('webgl2');

    if (gl) {
      setGl(gl);
      initWebGL(gl);
    }
  }, [initWebGL]);

  useEffect(() => {
    if (
      !stream ||
      !canvasRef.current ||
      !gl ||
      !programRef.current ||
      !textureRef.current ||
      !isLoading
    ) {
      return;
    }
    const video = document.createElement('video');

    video.srcObject = stream;
    video.play();

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // This hook is being called conditionally, but all hooks must be called in the exact same order in every component render.
    const _useProgram = gl.useProgram.bind(gl);

    drawFrame();
    setIsLoading(false);

    function drawFrame() {
      if (gl && canvasRef.current && programRef.current && textureRef.current) {
        gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);

        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video,
        );

        _useProgram(programRef.current);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      requestAnimationFrame(drawFrame);
    }
  }, [stream, width, height, gl, isLoading]);

  return { isLoading, canvasRef, gl };
}
