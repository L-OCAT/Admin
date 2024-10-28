import { ref } from "vue";

interface SnackbarOptions {
  timeout?: number;
  color?: string;
  position?: "top" | "bottom";
}

export const useSnackbar = (defaultOptions: SnackbarOptions = {}) => {
  const show = ref(false);
  const message = ref("");
  const timeout = ref(defaultOptions.timeout ?? 3000);
  const color = ref(defaultOptions.color ?? "error");
  const position = ref(defaultOptions.position ?? "bottom");

  const showMessage = (msg: string, options?: SnackbarOptions) => {
    message.value = msg;
    if (options?.color) color.value = options.color;
    if (options?.timeout) timeout.value = options.timeout;
    if (options?.position) position.value = options.position;
    show.value = true;
  };

  const hideMessage = () => {
    show.value = false;
  };

  return {
    show,
    message,
    color,
    timeout,
    position,
    showMessage,
    hideMessage,
  };
};

export type UseSnackbarReturn = ReturnType<typeof useSnackbar>;
