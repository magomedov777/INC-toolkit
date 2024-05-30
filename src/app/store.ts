import { tasksReducer } from '../features/TodolistsList/tasks-slice'
import { todolistsReducer } from '../features/TodolistsList/todolists-slice'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { appReducer } from './app-slice'
import { authReducer } from '../features/Login/auth-slice'
import { configureStore, UnknownAction } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer,
  },
})

export type AppRootStateType = ReturnType<typeof store.getState>

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppRootStateType,
  unknown,
  UnknownAction
>

export type AppDispatch = ThunkDispatch<AppRootStateType, unknown, UnknownAction>
