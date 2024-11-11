import React from "react";
import "./ReasonsToJoin.css";

function ReasonsToJoin() {
  const reason1 =
    "Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.";
  const reason2 =
    "Save your favourites easily and always have something to watch.";
  const reason3 =
    "Stream unlimited movies and TV shows on your phone, tablet, laptop and TV.";

  return (
    <div>
      <h4 className="reason-heading">More reasons to join</h4>
      <div className="container reasons-container">
        <div className="row">
          <div className="col reasons-box mx-2 my-2">
            <h3>Enjoy on your TV</h3>
            <p>{reason1}</p>
          </div>
          <div className="col reasons-box mx-2 my-2">
            <h3>Download your shows to watch offline</h3>
            <p>{reason2}</p>
          </div>
          <div className="col reasons-box mx-2 my-2">
            <h3>Watch everywhere</h3>
            <p>{reason3}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReasonsToJoin;
