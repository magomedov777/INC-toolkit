import { appActions } from 'app/app-slice'
import { ResponseType } from '../api/todolists-api'
import { Dispatch } from 'redux'

/**

Handles server app errors and updates the app state accordingly.
@template D - The type of data returned from the server response.
@param {ResponseType<D>} data - The server response data.
@param {Dispatch} dispatch - The dispatch function from the app's Redux store.
@returns {void}
*/

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
  if (data.messages.length) {
    dispatch(appActions.setAppError({ error: data.messages[0] }))
  } else {
    dispatch(appActions.setAppError({ error: 'Some error occurred' }))
  }
  dispatch(appActions.setAppStatus({ status: 'failed' }))
}
