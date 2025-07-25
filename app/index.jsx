import styles from "@/assets/style/styles.js";
import AddTaskButton from "@/components/AddTaskButton.jsx";
import CustomAlert from "@/components/CustomAlert.jsx";
import PageLoader from "@/components/PageLoader.jsx";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  IMPORTANCE_OPTIONS,
  importanceOrder,
  TABS,
} from "../constants/taskImportance";
import { loadTasks, saveTasks } from "../utils/taskUtils";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Index = () => {
  // State
  const [task, setTask] = useState("");
  const [timer, setTimer] = useState("");
  const [importance, setImportance] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("incomplete");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successAlertMessage, setSuccessAlertMessage] = useState("");
  // Add ticking state for live timer
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission for notifications not granted!");
        return;
      }
    })();
  }, []);

  useEffect(() => {
    loadTasks()
      .then((loadedTasks) => {
        setTasks(loadedTasks);
        setLoading(false);
      })
      .catch((e) => {
        console.log("Failed to load tasks", e);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    saveTasks(tasks).catch((e) => console.log("Failed to save tasks", e));
  }, [tasks]);

  // Effect to check for timer end and show notification

  useEffect(() => {
    tasks.forEach((t) => {
      if (!t.completed && !t.notified && t.endTime && Date.now() >= t.endTime) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Timer Ended",
            body: `The timer for task \"${t.name}\" has ended!`,
            sound: true,
          },
          trigger: null, // Immediate notification
        });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === t.id ? { ...task, notified: true } : task
          )
        );
      }
    });
  }, [tick, tasks]);

  // Loader
  if (loading) {
    return <PageLoader />;
  }

  // Add a new task
  const handleAddTask = async () => {
    if (!task.trim() || !timer.trim() || !importance) {
      setAlertMessage("Please enter a task, timer, and select importance.");
      setShowAlert(true);
      return;
    }
    const seconds = parseInt(timer, 10);
    if (isNaN(seconds) || seconds <= 0) {
      setAlertMessage(
        "Please enter a valid timer (positive number of seconds)."
      );
      setShowAlert(true);
      return;
    }

    // Edit mode: update the task (cancel previous notification and reschedule)
    if (editTaskId) {
      const prevTask = tasks.find((t) => t.id === editTaskId);
      if (prevTask && prevTask.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          prevTask.notificationId
        );
      }
      const endTime = Date.now() + seconds * 1000;
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Timer Ended",
          body: `Time to complete \"${task}\"`,
          // sound: true,
        },
        trigger: { seconds },
      });
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === editTaskId
            ? {
                ...t,
                name: task,
                timer,
                importance,
                endTime,
                notified: false,
                notificationId,
              }
            : t
        )
      );
      setEditTaskId(null);
      setTask("");
      setTimer("");
      setImportance("");
      setSuccessAlertMessage(`Task '${task}' has been edited!`);
      setShowSuccessAlert(true);
      return;
    }

    // Add mode: add a new task and schedule notification
    const endTime = Date.now() + seconds * 1000;
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Timer Ended",
        body: `Time to complete \"${task}\"`,
        sound: true,
      },
      trigger: { seconds },
    });
    const newTask = {
      id: Date.now().toString(),
      name: task,
      timer,
      importance,
      completed: false,
      endTime,
      notified: false, // Add notified property
      notificationId,
    };
    setTasks([...tasks, newTask]);
    setTask("");
    setTimer("");
    setImportance("");
    setSuccessAlertMessage(`Task '${newTask.name}' has been added!`);
    setShowSuccessAlert(true);
  };

  // Toggle task completion
  const handleToggleComplete = async (id) => {
    const toggledTask = tasks.find((t) => t.id === id);
    if (toggledTask && !toggledTask.completed && toggledTask.notificationId) {
      // Cancel the scheduled notification
      await Notifications.cancelScheduledNotificationAsync(
        toggledTask.notificationId
      );
    }
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    if (toggledTask && !toggledTask.completed) {
      // Marking as complete now
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Task Completed",
          body: `The task \"${toggledTask.name}\" is completed!`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Immediate notification
      });
    }
  };

  // Delete a task
  const handleDelete = async (id) => {
    const deletedTask = tasks.find((t) => t.id === id);
    setTasks(tasks.filter((t) => t.id !== id));
    setSuccessAlertMessage(
      `Task '${deletedTask?.name || ""}' has been deleted!`
    );
    setShowSuccessAlert(true);
  };

  // Edit a task (load into form but do not remove from list)
  const handleEdit = (id) => {
    const t = tasks.find((t) => t.id === id);
    if (t) {
      setTask(t.name);
      setTimer(t.timer);
      setImportance(t.importance);
      setEditTaskId(t.id);
    }
  };

  // Get remaining time in mm:ss
  const getRemaining = (t) => {
    if (!t.endTime || t.completed) return "00:00";
    const ms = t.endTime - Date.now();
    if (ms <= 0) return "00:00";
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, "0");
    const sec = (totalSec % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  // Filter tasks by tab
  const filteredTasks = tasks
    .filter((t) => t.completed === (tab === "complete"))
    .sort((a, b) => {
      const aOrder = importanceOrder[a.importance] ?? 99;
      const bOrder = importanceOrder[b.importance] ?? 99;
      return aOrder - bOrder;
    });

  // useEffect(() => {
  //   const timer = setTimeout(() => setLoading(false), 1000);
  //   return () => clearTimeout(timer);
  // }, []);

  // --- UI ---
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Task App</Text>
      {/* Task Input Form */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter task"
          value={task}
          onChangeText={setTask}
          placeholderTextColor="#b2bec3"
        />
        <TextInput
          style={styles.input}
          placeholder="Timer (seconds)"
          value={timer}
          onChangeText={setTimer}
          keyboardType="numeric"
          placeholderTextColor="#b2bec3"
        />
        <View style={styles.dropdownWrapper}>
          <View style={{ flex: 1 }}>
            <Picker
              selectedValue={importance}
              onValueChange={setImportance}
              style={styles.dropdownPicker}
              prompt="Select importance"
              dropdownIconColor="#888"
            >
              <Picker.Item label="Select importance" value="" color="#888" />
              {IMPORTANCE_OPTIONS.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  color={option.value}
                />
              ))}
            </Picker>
          </View>
          {/* Custom chevron for iOS (Android shows its own) */}
          {Platform.OS === "ios" && (
            <Feather
              name="chevron-down"
              size={22}
              color="#888"
              style={styles.dropdownChevron}
            />
          )}
        </View>

        {/* Add Task Button */}
        <AddTaskButton onPress={handleAddTask} />
      </View>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, tab === t.key && styles.tabTextActive]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Task List with FlatList for scrollable, performant rendering */}
      <FlatList
        style={styles.taskList}
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: "#aaa", alignSelf: "center", marginTop: 32 }}>
            No tasks here yet.
          </Text>
        }
        renderItem={({ item: t }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleToggleComplete(t.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkboxBox,
                  t.completed && styles.checkboxChecked,
                ]}
              >
                {t.completed && (
                  <Feather name="check" size={18} style={styles.checkboxTick} />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>{t.name}</Text>
              <View style={styles.taskMeta}>
                <View
                  style={[
                    styles.importanceDot,
                    { backgroundColor: t.importance },
                  ]}
                />
                <Text style={styles.timerText}>
                  {t.completed ? "Done" : getRemaining(t)}
                </Text>
              </View>
            </View>
            {/* Only show edit button if task is not completed */}
            {!t.completed && (
              <TouchableOpacity
                onPress={() => handleEdit(t.id)}
                style={styles.editBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="create-outline"
                  size={28}
                  color="#007bff"
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleDelete(t.id)}
              style={styles.deleteBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name="trash-bin"
                size={32}
                color="#e53935"
                style={styles.actionIcon}
              />
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <CustomAlert
        visible={showAlert}
        title="Missing Fields"
        message={alertMessage}
        onClose={() => setShowAlert(false)}
        confirmText="OK"
      />
      <CustomAlert
        visible={showSuccessAlert}
        title="Task Added"
        message={successAlertMessage}
        onClose={() => setShowSuccessAlert(false)}
        confirmText="OK"
      />
    </View>
  );
};

export default Index;
