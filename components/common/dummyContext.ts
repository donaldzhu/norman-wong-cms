import type { Ref } from '../types/media'
import { createContext } from 'react'

export const DummyContext = createContext<Ref | undefined>(undefined)
