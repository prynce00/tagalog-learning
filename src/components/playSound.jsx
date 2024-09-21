import React, { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'


const PlaySound = ({ filename }) => {
  const audioRef = useRef(null)
  const voice = "Zhiyu"


 

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.src = require(`../assets/sounds/${voice}/${filename}.mp3`)
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
