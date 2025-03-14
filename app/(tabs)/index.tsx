import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DraggableFlatList from "react-native-draggable-flatlist"; // Importe a biblioteca
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function HomeScreen() {
  // valores das novas tarefas
  const [status, setStatus] = useState("pendente");
  const [nameTask, setNameTask] = useState("");
  const [descriptionTask, setDescriptionTask] = useState("");
  const [dateTask, setDateTask] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  type Task = {
    nameTask: string;
    descriptionTask: string;
    dateTask: string;
    status: string;
  };

  const [tasks, setTasks] = useState<Task[]>([]);

  // salvar tarefas
  const saveTask = async () => {
    const newTask = {
      nameTask,
      descriptionTask,
      dateTask,
      status,
      id: Date.now(),
    };
    try {
      const updatedTasks = [...tasks, newTask];
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      console.log("Tarefa salva com sucesso!");
    } catch (error) {
      console.log("Erro ao salvar tarefa:", error);
    }
  };

  // carregamento das tarefas
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.log("Erro ao carregar tarefas:", error);
    }
  };

  // função para arrastar as tarefas
  const onDragEnd = ({ data }: { data: Task[] }) => {
    setTasks(data);
    AsyncStorage.setItem("tasks", JSON.stringify(data)); // Salva a nova ordem
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            backgroundColor: "rgb(184, 184, 184)",
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
            TAREFAS
          </Text>

          <View
            style={{
              width: "70%",
              padding: 20,
              alignItems: "center",
              backgroundColor: "rgb(226, 226, 226)",
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 20 }}>Nome da tarefa:</Text>
            <TextInput
              style={{
                backgroundColor: "white",
                width: "100%",
                height: 40,
                borderRadius: 5,
                paddingHorizontal: 8,
                marginBottom: 10,
              }}
              onChangeText={(value) => setNameTask(value)} // pegando o valor do input
            />

            <Text style={{ fontSize: 20 }}>Descrição da tarefa:</Text>
            <TextInput
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: "white",
                width: "100%",
                height: 100,
                borderRadius: 5,
                paddingHorizontal: 8,
                textAlignVertical: "top",
                marginBottom: 10,
              }}
              onChangeText={(value) => setDescriptionTask(value)}
            />

            <Text style={{ fontSize: 20 }}>Prazo:</Text>
            <TextInput
              style={{
                backgroundColor: "white",
                width: "100%",
                borderRadius: 5,
                paddingHorizontal: 8,
                textAlignVertical: "top",
                marginBottom: 10,
              }}
              onChangeText={(value) => setDateTask(value)}
            />

            <Button title="Adicionar Tarefa" onPress={saveTask} />
          </View>

          <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 20 }}>
            Lista de Tarefa:
          </Text>

          <DraggableFlatList
            style={{ width: 300 }}
            data={tasks}
            onDragEnd={onDragEnd}
            keyExtractor={(item, index) => `draggable-item-${index}`}
            // @ts-ignore-next-line
            renderItem={({ item, index, drag, isActive }) => (
              <View
                style={{
                  width: "100%",
                  padding: 20,
                  alignItems: "center",
                  backgroundColor: "rgb(226, 226, 226)",
                  borderRadius: 4,
                  marginTop: 10,
                  opacity: isActive ? 0.5 : 1,
                }}
              >
                <View style={{ flexDirection: "row", width: "100%", gap: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Nome da Tarefa:</Text>
                  <Text>{item.nameTask}</Text>
                </View>

                <View style={{ flexDirection: "row", width: "100%", gap: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Descrição</Text>
                  <Text>{item.descriptionTask}</Text>
                </View>

                <View style={{ flexDirection: "row", width: "100%", gap: 10 }}>
                  <Text style={{ fontWeight: "bold" }}>Data:</Text>
                  <Text>{item.dateTask}</Text>
                </View>
                <Text style={{ fontSize: 20 }}>Status:</Text>
                <View
                  style={{
                    backgroundColor: "white",
                    width: "100%",
                    borderRadius: 5,
                    paddingHorizontal: 8,
                    justifyContent: "center",
                  }}
                >
                  <Picker
                    selectedValue={item.status}
                    onValueChange={(itemValue) => {
                      const updatedTasks = tasks.map((task, i) => {
                        if (i === index) {
                          task.status = itemValue;
                        }
                        return task;
                      });
                      setTasks(updatedTasks);
                      AsyncStorage.setItem(
                        "tasks",
                        JSON.stringify(updatedTasks)
                      );
                    }}
                    style={{ height: 80, width: "100%" }}
                  >
                    <Picker.Item label="Pendente" value="pendente" />
                    <Picker.Item label="Em andamento" value="em_andamento" />
                    <Picker.Item label="Concluída" value="concluida" />
                  </Picker>
                </View>
                <Button
                  title="Editar Tarefa"
                  onPress={() => setModalVisible(true)}
                />
                <View style={{ height: 20 }} />
                <Button title="Arrastar" onPress={drag} />
              </View>
            )}
          />

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View
                  style={{
                    width: "70%",
                    padding: 20,
                    alignItems: "center",
                    backgroundColor: "rgb(226, 226, 226)",
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>Nome da tarefa:</Text>
                  <TextInput
                    style={{
                      backgroundColor: "white",
                      width: "100%",
                      height: 40,
                      borderRadius: 5,
                      paddingHorizontal: 8,
                      marginBottom: 10,
                    }}
                    onChangeText={(value) => setNameTask(value)}
                  />

                  <Text style={{ fontSize: 20 }}>Descrição da tarefa:</Text>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    style={{
                      backgroundColor: "white",
                      width: "100%",
                      height: 100,
                      borderRadius: 5,
                      paddingHorizontal: 8,
                      textAlignVertical: "top",
                      marginBottom: 10,
                    }}
                    onChangeText={(value) => setDescriptionTask(value)}
                  />
                  <Text style={{ fontSize: 20 }}>Prazo:</Text>
                  <TextInput
                    style={{
                      backgroundColor: "white",
                      width: "100%",
                      borderRadius: 5,
                      paddingHorizontal: 8,
                      textAlignVertical: "top",
                      marginBottom: 10,
                    }}
                    onChangeText={(value) => setDateTask(value)}
                  />

                  <Button title="Editar Tarefa" onPress={() => {}} />
                </View>
                <Button
                  title="Fechar Modal"
                  onPress={() => setModalVisible(false)}
                />
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
});
