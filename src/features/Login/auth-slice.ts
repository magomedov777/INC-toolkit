/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dispatch } from 'redux'
import { LoginParamsType } from '../../api/todolists-api'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk } from 'app/store'
import { appActions } from 'app/app-slice'
import { handleServerAppError } from 'utils/handle-server-app-error'
import { handleServerNetworkError } from 'utils/handle-server-network-error'
import { ResultCode } from 'utils/enums'
import { authAPI } from 'api/auth-api'
import { createAppAsyncThunk } from 'utils/create-app-async-thunk'

const slice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
  },
})

const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
  `${slice.name}/initializeApp`,
  async (_, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      const res = await authAPI.me()
      if (res.data.resultCode === ResultCode.success) {
        return { isLoggedIn: true }
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    } finally {
      dispatch(appActions.setAppInitialized({ isInitialized: true }))
    }
  }
)

const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>(
  `${slice.name}/login`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: 'loading' }))
      const res = await authAPI.login(arg)
      if (res.data.resultCode === ResultCode.success) {
        dispatch(appActions.setAppStatus({ status: 'succeeded' }))
        return { isLoggedIn: true }
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

const logout = createAppAsyncThunk<{ isLoggedIn: boolean }, void>(
  `${slice.name}/login`,
  async (_, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: 'loading' }))
      const res = await authAPI.logout()
      if (res.data.resultCode === ResultCode.success) {
        dispatch(appActions.setAppStatus({ status: 'succeeded' }))
        return { isLoggedIn: false }
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

export const authActions = slice.actions
export const authReducer = slice.reducer
export const authThunks = { login, logout, initializeApp }
