import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "tasks";

/**
 * Load tasks from AsyncStorage
 * @returns {Promise<Array>} Array of task objects
 */
export const loadTasks = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.log("Failed to load tasks", e);
    return [];
  }
};

/**
 * Save tasks to AsyncStorage
 * @param {Array} tasks - Array of task objects
 */
export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.log("Failed to save tasks", e);
  }
};
