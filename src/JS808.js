import React, { useState, useEffect, useRef } from 'react';
import { ReactComponent as StopIcon } from './icons/stop.svg';
import { ReactComponent as PlayIcon } from './icons/play.svg';
import { ReactComponent as SquareIcon } from './icons/square.svg';
import { playPattern, animateCells } from './functions';
import * as patterns from './patterns';

export default function JS808() {
  const [pattern, setPattern] = useState(patterns.init.pattern);
  const [playing, setPlaying] = useState(false);
  const [clock, setClock] = useState(-1);
  const [bpm, setBpm] = useState(128);

  // timeline clock
  const interval = useRef(null);
  useEffect(() => {
    if (playing) {
      interval.current = setInterval(
        () => setClock((prev) => (prev === 15 ? 0 : prev + 1)),
        15000 / bpm
      );
    } else {
      clearInterval(interval.current);
      setClock(-1);
    }
    return () => clearInterval(interval.current);
  }, [interval, playing, bpm]);

  useEffect(() => {
    if (playing && clock !== -1) {
      animateCells(clock);
      playPattern(pattern, clock);
    }
  }, [playing, clock, pattern]);

  function toggleCell(i, inst) {
    setPattern((prev) => ({
      ...prev,
      [i]: {
        ...prev[i],
        [inst]: prev[i][inst] === 0 ? 1 : prev[i][inst] === 1 ? 0.5 : 0,
      },
    }));
  }

  return (
    <div id='js808'>
      <div id='top'>
        <h1 it='title'>JS-808</h1>
        <Transport setPlaying={setPlaying} bpm={bpm} setBpm={setBpm} />
        <PatternSelector setPattern={setPattern} setBpm={setBpm} />
      </div>
      <div id='sequencer-container'>
        <div id='sequencer'>
          <Timeline pattern={pattern} />
          <Instrument inst={'kick'} pattern={pattern} toggleCell={toggleCell} />
          <Instrument inst={'snr'} pattern={pattern} toggleCell={toggleCell} />
          <Instrument inst={'oh'} pattern={pattern} toggleCell={toggleCell} />
          <Instrument inst={'ch'} pattern={pattern} toggleCell={toggleCell} />
        </div>
      </div>
    </div>
  );
}

function Transport({ setPlaying, bpm, setBpm }) {
  const handleChange = ({ target: { value } }) => {
    if (value && !value[value.length - 1].match(/\d/)) return;
    setBpm(value > 300 ? 300 : value < 1 ? 1 : value);
  };

  return (
    <div id='transport'>
      <button id='stop' onClick={() => setPlaying(false)}>
        <StopIcon className='icon' />
      </button>
      <button id='play' onClick={() => setPlaying(true)}>
        <PlayIcon className='icon' />
      </button>
      <input id='bpm' value={bpm} onChange={handleChange} />
      <label htmlFor='bpm' id='bpm-label'>
        bpm
      </label>
    </div>
  );
}

function PatternSelector({ setBpm, setPattern }) {
  const handleChange = ({ target: { value } }) => {
    setBpm(patterns[value].bpm);
    setPattern(patterns[value].pattern);
  };
  return (
    <select id='sequence-select' onChange={handleChange}>
      {Object.keys(patterns).map((pattern, i) => {
        return (
          <option key={`map-option-${pattern}`} value={pattern}>
            {pattern}
          </option>
        );
      })}
    </select>
  );
}

function Timeline({ pattern }) {
  return (
    <div id='timeline' className='inst'>
      <div className='inst-label'></div>
      <div id='timeline-grid' className='inst-grid'>
        {Object.entries(pattern).map((cell, i) => {
          return (
            <p key={`timeline-${i}`} className={`cell cell-${i} tl`}>
              {i + 1}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function Instrument({ inst, toggleCell, pattern }) {
  const styles = `cell cell-${inst}`;
  const label = `${inst}-label`;
  return (
    <div id={inst} className='inst'>
      <div className='inst-label'>
        <h2 id={label}>{inst}</h2>
      </div>
      <div className='inst-grid'>
        {Object.entries(pattern).map((cell, i) => {
          const id = `${inst}-${i}`;
          return (
            <div
              key={id}
              id={id}
              className={
                pattern[i][inst] === 0
                  ? styles + ` cell-${i}`
                  : pattern[i][inst] === 1
                  ? styles + ` cell-${i} full`
                  : styles + ` cell-${i} half`
              }
              onMouseDown={() => toggleCell(i, inst)}
            >
              <SquareIcon />
            </div>
          );
        })}
      </div>
    </div>
  );
}
