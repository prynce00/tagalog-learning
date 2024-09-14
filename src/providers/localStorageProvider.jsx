import React, { createContext, useContext, useState, useEffect } from 'react'

// Create a context for localStorage
const LocalStorageContext = createContext()

// Helper function to deeply merge objects
const mergeDeep = (target, source) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeDeep(target[key], source[key]))
    }
  }
  Object.assign(target || {}, source)
  return target
}

// Provider component to manage localStorage updates
export const LocalStorageProvider = ({ children }) => {
  const [localStorageState, setLocalStorageState] = useState(() => {
    const storedValues = {}
    Object.keys(localStorage).forEach(key => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key))
        if (parsed && typeof parsed === 'object') {
          mergeDeep(storedValues, { [key]: parsed })
        } else {
          storedValues[key] = parsed
        }
      } catch {
        storedValues[key] = localStorage.getItem(key)
      }
    })
    return storedValues
  })

  const setLocalStorageValues = values => {
    setLocalStorageState(prevState => {
      const newState = { ...prevState }
      Object.entries(values).forEach(([key, value]) => {
        newState[key] = value
        window.localStorage.setItem(key, JSON.stringify(value))
      })
      return newState
    })
  }

  // Track changes to localStorage and update state
  useEffect(() => {
    const handleStorageChange = event => {
      if (event.storageArea === localStorage) {
        const newValue = JSON.parse(event.newValue)
        setLocalStorageState(prevState => ({
          ...prevState,
          [event.key]: newValue
        }))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <LocalStorageContext.Provider
      value={{ storage: localStorageState, setStorage: setLocalStorageValues }}
    >
      {children}
    </LocalStorageContext.Provider>
  )
}

export const useLocalStorageContext = () => {
  return useContext(LocalStorageContext)
}
