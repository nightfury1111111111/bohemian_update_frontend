import React, { useState, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

// #region constants

// #endregion

// #region styled-components

// #endregion

// #region functions

// #endregion

// #region component
const propTypes = {
  time: Number,
};

const defaultProps = {};

/**
 *
 */
const Clock = (props: any) => {
  const [time, setTime] = useState(0);
  const [leftTime, setLeftTime] = useState(0);

  useEffect(() => {
    setTime(props.time - Number(new Date()));
    // const interval = setInterval(() => {
    //   console.log("Interval called");
    //   setLeftTime(
    //     time - Number(new Date()) > 0 ? time - Number(new Date()) : 0
    //   );
    //   console.log(
    //     "Time Left: ",
    //     time - Number(new Date()),
    //     time,
    //     Number(new Date())
    //   );
    //   console.log(leftTime);
    // }, 5000);
    // return clearInterval(interval);
  }, [props.time]);

  useEffect(() => {
    setTimeout(() => {
      setTime(time - 60000);
    }, 60000);
  }, [time]);

  return (
    <div>
      {Math.floor(time / 1000 / 3600 / 24)} days{" "}
      {Math.floor((time % (1000 * 3600 * 24)) / (3600 * 1000))} hours
      {Math.floor((time % (3600 * 1000)) / 60000)} minutes left
    </div>
  );
};

Clock.propTypes = propTypes;
Clock.defaultProps = defaultProps;
// #endregion

export default Clock;
