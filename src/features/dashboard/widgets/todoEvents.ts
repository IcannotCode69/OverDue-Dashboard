export const TODO_ADD_EVENT = "od:addTodoTask";

export interface AddTodoTaskDetail {
  text: string;
  source?: string;
}

export function emitAddTodoTask(detail: AddTodoTaskDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(TODO_ADD_EVENT, {
      detail,
    })
  );
}
