"use client";

import React from "react";
import { useCommunicationContext } from "../contexts/CommunicationContext";
import Link from "next/link";
import {
  BsFillMicFill,
  BsFillMicMuteFill,
  BsCameraVideoFill,
  BsCameraVideoOffFill,
} from "react-icons/bs";
const VideoControls = () => {
  const {
    connections,
    turnOffCamera,
    turnOnCamera,
    cameraState,
    turnOnMic,
    turnOffMic,
    micState,
    myStream,
  } = useCommunicationContext();

  return (
    <div style={{ padding: "30px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <div>
          <video
            ref={(videoRef) => {
              if (!videoRef) return;
              videoRef.srcObject = myStream;
            }}
            autoPlay
            muted
            style={{
              borderRadius: "20px",
              width: "300px",
              outline: "5px solid green",
            }}
          />
        </div>

        {connections.map(({ peerId, mediaStream }, index) => (
          <div key={`${peerId} ${index}`}>
            <video
              ref={(videoRef) => {
                if (!videoRef) return;
                videoRef.srcObject = mediaStream;
              }}
              autoPlay
              style={{
                borderRadius: "20px",
                width: "300px",
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "fixed",
          width: "100%",
          bottom: "30px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <button
          onClick={() => {
            if (cameraState === "On") turnOffCamera();
            else turnOnCamera();
          }}
          style={{
            borderRadius: "100px",
            width: "50px",
            height: "50px",
            display: "grid",
            placeContent: "center",
            fontSize: "1.3rem",

            ...(cameraState === "Off"
              ? {
                  backgroundColor: "red",
                  color: "white",
                }
              : {
                  backgroundColor: "white",
                  color: "black",
                  outline: "1px solid black",
                }),
          }}
        >
          {cameraState === "Off" ? (
            <BsCameraVideoOffFill />
          ) : (
            <BsCameraVideoFill />
          )}
        </button>
        <button
          onClick={() => {
            if (micState === "On") turnOffMic();
            else turnOnMic();
          }}
          style={{
            borderRadius: "100px",
            width: "50px",
            height: "50px",
            display: "grid",
            placeContent: "center",
            fontSize: "1.3rem",

            ...(micState === "Off"
              ? {
                  backgroundColor: "red",
                  color: "white",
                }
              : {
                  backgroundColor: "white",
                  color: "black",
                  outline: "1px solid black",
                }),
          }}
        >
          {micState === "Off" ? <BsFillMicMuteFill /> : <BsFillMicFill />}
        </button>
        <Link
          href={"/"}
          style={{
            backgroundColor: "red",
            color: "white",
            borderRadius: "100px",
            padding: "16px 20px",
          }}
          onClick={() => {
            connections.forEach((connection) => {
              connection.closeConnection!();
            });
          }}
        >
          Leave Meeting
        </Link>
      </div>
    </div>
  );
};

export default VideoControls;
