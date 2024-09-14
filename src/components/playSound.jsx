import React, { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { pinyin } from 'pinyin-pro'

const PlaySound = ({ filename }) => {
  const audioRef = useRef(null)

  const processedFilename = pinyin(filename, {
    toneType: 'num',
    format: 'normal'
  })

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.src = require(`../assets/sounds/${processedFilename}.mp3`)
      audioRef.current
        .play()
        .then(() => {
          console.log('Audio playback started.')
        })
        .catch(err => {
          console.error('Error playing sound:', err)
        })
    }
  }

  return (
    <div>
      <FontAwesomeIcon
        icon={faVolumeUp}
        onClick={playSound}
        style={{ cursor: 'pointer', fontSize: '24px' }}
      />
      <audio ref={audioRef} preload='auto' />
    </div>
  )
}

export default PlaySound
