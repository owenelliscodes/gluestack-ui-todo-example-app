import React, { useState, useRef } from "react";
import { VStack } from "@/components/ui/vstack";
import { FormControl } from "@/components/ui/form-control";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { AddIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { defaultTodos } from "@/constants/todo";
import TodoContainer, { Todo } from "@/components/app-components/TodoContainer";
import shortid from "shortid";
import { View, PanResponder, Animated, PanResponderGestureState } from "react-native";

const Home = () => {
  const [item, setItem] = useState("");
  const [todos, setTodos] = useState<Todo[]>(defaultTodos);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: 0,
          y: pan.y._value
        });
      },
      onPanResponderMove: (_, gestureState) => {
        if (draggingIndex !== null) {
          Animated.event([null, { dy: pan.y }], {
            useNativeDriver: false
          })(_, gestureState);
          
          // Calculate new index based on drag position
          const newIndex = Math.max(
            0,
            Math.min(
              Math.floor(draggingIndex + gestureState.dy / 50),
              todos.length - 1
            )
          );
          
          if (newIndex !== draggingIndex) {
            reorderTodos(draggingIndex, newIndex);
            setDraggingIndex(newIndex);
          }
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        setDraggingIndex(null);
        pan.setValue({ x: 0, y: 0 });
      }
    })
  ).current;

  const addTodo = (task: string) => {
    const lastTodo = todos[todos?.length - 1];
    if (lastTodo?.task !== "" && task !== "") {
      setTodos([
        ...todos,
        {
          id: shortid.generate(),
          task: task,
          completed: false,
        },
      ]);
      setItem("");
    }
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos?.map((todo) => {
      if (todo.id === id) {
        todo.completed = !todo.completed;
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  const reorderTodos = (fromIndex: number, toIndex: number) => {
    const updatedTodos = [...todos];
    const [movedItem] = updatedTodos.splice(fromIndex, 1);
    updatedTodos.splice(toIndex, 0, movedItem);
    setTodos(updatedTodos);
  };

  return (
    <VStack className="flex-1 bg-secondary-100 md:bg-secondary-0 md:items-center md:justify-center ">
      <VStack className="rounded-md bg-secondary-100 md:h-[500px] md:w-[700px]">
        <FormControl className="my-4">
          <Input variant="underlined" size="sm" className="mx-6 my-2">
            <InputField
              placeholder="What is your next task?"
              value={item}
              onChangeText={(value) => setItem(value)}
              onSubmitEditing={() => addTodo(item)}
            />
            <Pressable onPress={() => addTodo(item)}>
              <InputIcon as={AddIcon} className="cursor-pointer h-3 w-3" />
            </Pressable>
          </Input>
        </FormControl>
        {todos?.map((todo: Todo, index: number) => (
          <Animated.View
            key={todo.id}
            {...(index === draggingIndex ? panResponder.panHandlers : {})}
            style={[
              index === draggingIndex && {
                transform: [{ translateY: pan.y }],
                opacity: 0.7,
                zIndex: 999,
              }
            ]}
          >
            <TodoContainer
              todo={todo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              onDragStart={() => setDraggingIndex(index)}
              isDragging={draggingIndex === index}
            />
          </Animated.View>
        ))}
      </VStack>
    </VStack>
  );
};

export default Home;
