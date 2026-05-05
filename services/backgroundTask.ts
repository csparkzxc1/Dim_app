import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

export const WAKE_WINDOW_TASK = 'dim-wake-window-task';

const MIN_INTERVAL_SECONDS = 15 * 60;

if (!TaskManager.isTaskDefined(WAKE_WINDOW_TASK)) {
  TaskManager.defineTask(WAKE_WINDOW_TASK, async () => {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  });
}

export async function registerWakeWindowTask(): Promise<void> {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    WAKE_WINDOW_TASK,
  );
  if (isRegistered) return;

  await BackgroundFetch.registerTaskAsync(WAKE_WINDOW_TASK, {
    minimumInterval: MIN_INTERVAL_SECONDS,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterWakeWindowTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    WAKE_WINDOW_TASK,
  );
  if (!isRegistered) return;
  await BackgroundFetch.unregisterTaskAsync(WAKE_WINDOW_TASK);
}
