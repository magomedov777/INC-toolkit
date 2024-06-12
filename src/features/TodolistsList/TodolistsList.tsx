/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { AppRootStateType } from '../../app/store'
import {
  FilterValuesType,
  TodolistDomainType,
  todolistsActions,
  todolistsThunks,
} from './todolists-slice'
import { TasksStateType, tasksThunks } from './tasks-slice'
import { Grid, Paper } from '@mui/material'
import { AddItemForm } from '../../components/AddItemForm/AddItemForm'
import { Todolist } from './Todolist/Todolist'
import { Navigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { TaskStatuses } from 'utils/enums'

type PropsType = {
  demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(
    (state) => state.todolists
  )
  const tasks = useSelector<AppRootStateType, TasksStateType>((state) => state.tasks)
  const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return
    }
    dispatch(todolistsThunks.fetchTodolists())
  }, [])

  const removeTask = (taskId: string, todolistId: string) => {
    dispatch(tasksThunks.removeTask({ taskId, todolistId }))
  }

  const addTask = (title: string, todolistId: string) => {
    dispatch(tasksThunks.addTask({ title, todolistId }))
  }

  const changeStatus = (taskId: string, status: TaskStatuses, todolistId: string) => {
    dispatch(tasksThunks.updateTask({ taskId, domainModel: { status }, todolistId }))
  }

  const changeTaskTitle = (taskId: string, title: string, todolistId: string) => {
    dispatch(tasksThunks.updateTask({ taskId, domainModel: { title }, todolistId }))
  }

  const changeFilter = (filter: FilterValuesType, id: string) => {
    dispatch(todolistsActions.changeTodolistFilter({ id, filter }))
  }

  const removeTodolist = (id: string) => {
    dispatch(todolistsThunks.removeTodolist(id))
  }

  const changeTodolistTitle = (id: string, title: string) => {
    dispatch(todolistsThunks.changeTodolistTitle({ id, title }))
  }

  const addTodolist = useCallback(
    (title: string) => {
      dispatch(todolistsThunks.addTodolist(title))
    },
    [dispatch]
  )

  if (!isLoggedIn) {
    return <Navigate to={'/login'} />
  }

  return (
    <>
      <Grid container style={{ padding: '20px' }}>
        <AddItemForm addItem={addTodolist} />
      </Grid>
      <Grid container spacing={3}>
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id]

          return (
            <Grid item key={tl.id}>
              <Paper style={{ padding: '10px' }}>
                <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                  removeTask={removeTask}
                  changeFilter={changeFilter}
                  addTask={addTask}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolist}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitle}
                  demo={demo}
                />
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
