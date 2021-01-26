import {
  combineReducers,
  configureStore,
  createSlice,
  getDefaultMiddleware,
  PayloadAction,
} from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { v4 as uuid } from "uuid";
import { Todo } from "./type";
import logger from "redux-logger";

const todosInitialState: Todo[] = [
  {
    id: uuid(),
    desc: "Learn React",
    isComplete: true,
  },
  {
    id: uuid(),
    desc: "Learn Redux",
    isComplete: true,
  },
  {
    id: uuid(),
    desc: "Learn Redux-ToolKit",
    isComplete: false,
  },
];

const todosSlice = createSlice({
  name: "todos",
  initialState: todosInitialState,
  reducers: {
    // switch문 대신 action type을 key로 사용
    // 반드시 payload가 action에 포함되어야한다
    edit: (state, { payload }: PayloadAction<{ id: string; desc: string }>) => {
      // immer가 state변경을 immutable하게 처리함
      const todoToEdit = state.find((todo) => todo.id === payload.id);
      if (todoToEdit) {
        todoToEdit.desc = payload.desc;
      }
    },
    toggle: (
      state,
      { payload }: PayloadAction<{ id: string; isComplete: boolean }>
    ) => {
      const todoToEdit = state.find((todo) => todo.id === payload.id);
      if (todoToEdit) {
        todoToEdit.isComplete = payload.isComplete;
      }
    },
    remove: (state, { payload }: PayloadAction<{ id: string }>) => {
      const index = state.findIndex((todo) => todo.id === payload.id);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
    create: {
      reducer: (
        state,
        {
          payload,
        }: PayloadAction<{ desc: string; id: string; isComplete: boolean }>
      ) => {
        state.push(payload);
      },
      prepare: ({ desc }: { desc: string }) => {
        // action creator가 전달받은 인자를 변경하는 로직이 있었다면 prepare에서 처리
        return {
          payload: {
            id: uuid(),
            desc,
            isComplete: false,
          },
        };
      },
    },
  },
});

const selectedTodoSlice = createSlice({
  name: "selectedTodo",
  initialState: null as string | null,
  reducers: {
    // initial value를 변형시키기 때문에 default가 원시형이면 object가 아니라서 변형 할 수 없다
    select: (state, { payload }: PayloadAction<{ id: string }>) => payload.id,
  },
});

const counterSlice = createSlice({
  name: "counter",
  initialState: 0,
  reducers: {},
  extraReducers: {
    //외부 slice의 action type을 사용해야 할때
    [todosSlice.actions.create.type]: (state) => state + 1,
    [todosSlice.actions.edit.type]: (state) => state + 1,
    [todosSlice.actions.toggle.type]: (state) => state + 1,
    [todosSlice.actions.remove.type]: (state) => state + 1,
  },
});

//export action creator
export const {
  create: createTodoActionCreator,
  edit: editTodoActionCreator,
  toggle: toggleTodoActionCreator,
  remove: deleteTodoActionCreator,
} = todosSlice.actions;

export const { select: selectTodoActionCreator } = selectedTodoSlice.actions;

const reducer = {
  todos: todosSlice.reducer,
  counter: counterSlice.reducer,
  selectedTodo: selectedTodoSlice.reducer,
};

export default configureStore({
  reducer,
  middleware: [...getDefaultMiddleware(), logger], //middleware가 덮어씌워지지 않게 기존 것과 합친다
  // devTools: true //default
  devTools: process.env.NODE_ENV !== "production",
});
