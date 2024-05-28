/* eslint-disable @typescript-eslint/no-unused-vars */
import { todolistsAPI, TodolistType } from '../../api/todolists-api'
import { Dispatch } from 'redux'
import { appActions, RequestStatusType } from '../../app/app-slice'
import { handleServerNetworkError } from '../../utils/error-utils'
import { AppThunk } from '../../app/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'todolists',
  initialState: [] as TodolistDomainType[],
  reducers: {
    removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
      const index = state.findIndex((tl) => tl.id === action.payload.id)
      if (index !== -1) state.splice(index, 1)
    },
    addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
      state.unshift({
        ...action.payload.todolist,
        filter: 'all',
        entityStatus: 'idle',
      })
    },
    changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const index = state.findIndex((tl) => tl.id === action.payload.id)
      if (index !== -1) state[index].title = action.payload.title
    },
    changeTodolistFilter: (
      state,
      action: PayloadAction<{ id: string; filter: FilterValuesType }>
    ) => {
      const index = state.findIndex((tl) => tl.id === action.payload.id)
      if (index !== -1) state[index].filter = action.payload.filter
      //2
      //const tl = state.find((tl) => tl.id === action.payload.id)
      //if(tl) tl.filter = action.payload.filter
    },
    changeTodolistEntityStatus: (
      state,
      action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>
    ) => {
      const index = state.findIndex((tl) => tl.id === action.payload.id)
      if (index !== -1) state[index].entityStatus = action.payload.entityStatus
    },
    setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
      return action.payload.todolists.map((el) => ({ ...el, filter: 'all', entityStatus: 'idle' }))

      //2
      // action.payload.todolists.forEach((el) => {
      //   state.push({ ...el, filter: 'all', entityStatus: 'idle' })
      //})
    },
  },
})

export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: 'loading' }))
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({ todolists: res.data }))
        dispatch(appActions.setAppStatus({ status: 'succeeded' }))
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }
}
export const removeTodolistTC = (id: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: 'loading' }))
    dispatch(todolistsActions.changeTodolistEntityStatus({ id, entityStatus: 'loading' }))
    todolistsAPI.deleteTodolist(id).then((res) => {
      dispatch(todolistsActions.removeTodolist({ id }))
      dispatch(appActions.setAppStatus({ status: 'succeeded' }))
    })
  }
}
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: 'loading' }))
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolist({ todolist: res.data.data.item }))
      dispatch(appActions.setAppStatus({ status: 'succeeded' }))
    })
  }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title).then((res) => {
      dispatch(todolistsActions.changeTodolistTitle({ id, title }))
    })
  }
}

export type FilterValuesType = 'all' | 'active' | 'completed'
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
