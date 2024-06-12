/* eslint-disable @typescript-eslint/no-unused-vars */
import { todolistsAPI, TodolistType } from '../../api/todolists-api'
import { Dispatch } from 'redux'
import { appActions, RequestStatusType } from '../../app/app-slice'
import { AppThunk } from '../../app/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { handleServerNetworkError } from 'utils/handle-server-network-error'
import { createAppAsyncThunk } from 'utils/create-app-async-thunk'

const slice = createSlice({
  name: 'todolists',
  initialState: [] as TodolistDomainType[],
  reducers: {
    changeTodolistFilter: (
      state,
      action: PayloadAction<{ id: string; filter: FilterValuesType }>
    ) => {
      const index = state.findIndex((tl) => tl.id === action.payload.id)
      if (index !== -1) state[index].filter = action.payload.filter
    },
    changeTodolistEntityStatus: (
      state,
      action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>
    ) => {
      const index = state.findIndex((tl) => tl.id === action.payload.id)
      if (index !== -1) state[index].entityStatus = action.payload.entityStatus
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.map((tl) => ({
          ...tl,
          filter: 'all',
          entityStatus: 'idle',
        }))
      })
      .addCase(removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex((tl) => tl.id === action.payload.id)
        if (index !== -1) state.splice(index, 1)
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        state.unshift({
          ...action.payload.todolist,
          filter: 'all',
          entityStatus: 'idle',
        })
      })
      .addCase(changeTodolistTitle.fulfilled, (state, action) => {
        const index = state.findIndex((tl) => tl.id === action.payload.id)
        if (index !== -1) state[index].title = action.payload.title
      })
  },
})

const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, void>(
  `${slice.name}/fetchTodolists`,
  async (_, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: 'loading' }))
      const res = await todolistsAPI.getTodolists()
      dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      return { todolists: res.data }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

const removeTodolist = createAppAsyncThunk<{ id: string }, string>(
  `${slice.name}/removeTodolist`,
  async (id, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: 'loading' }))
      dispatch(todolistsActions.changeTodolistEntityStatus({ id, entityStatus: 'loading' }))
      const res = await todolistsAPI.deleteTodolist(id)
      dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      return { id }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>(
  `${slice.name}/addTodolist`,
  async (title, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: 'loading' }))
      const res = await todolistsAPI.createTodolist(title)
      dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      return { todolist: res.data.data.item }
    } catch (e) {
      handleServerNetworkError(e, dispatch)
      return rejectWithValue(null)
    }
  }
)

export type ChangeTodolistTitleArgType = {
  id: string
  title: string
}

const changeTodolistTitle = createAppAsyncThunk<
  ChangeTodolistTitleArgType,
  ChangeTodolistTitleArgType
>(`${slice.name}/changeTodolistTitle`, async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  try {
    todolistsAPI.updateTodolist(arg.id, arg.title)
    return arg
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export type FilterValuesType = 'all' | 'active' | 'completed'
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
export const todolistsThunks = { fetchTodolists, removeTodolist, addTodolist, changeTodolistTitle }
