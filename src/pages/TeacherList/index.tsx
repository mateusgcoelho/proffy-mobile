import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { TextInput, BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-community/async-storage';

import TeacherItem, { Teacher } from '../../components/TeacherItem';
import PageHeader from '../../components/PageHeader';

import styles from './styles';
import api from '../../service/api';
import { useFocusEffect } from '@react-navigation/native';

const TeacherList: React.FC = () => {
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState({
    message: '',
    status: false
  })

  const [teachers, setTeachers] = useState([])
  const [favorites, setFavorites] = useState<number[]>([])

  const [subject, setSubject] = useState('')
  const [week_day, setWeek_day] = useState('')
  const [time, setTime] = useState('')

  function loadFavorites() {
    AsyncStorage.getItem('favorites').then(res => {
      if (res) {
        const favoritedTeachers = JSON.parse(res)
        const favoritedTeachersIds = favoritedTeachers.map((teacher: Teacher) => {
          return teacher.id
        })
        setFavorites(favoritedTeachersIds)
      }
    })
  }
  
  async function handleFiltersSubmit() {
    loadFavorites()

    try {
      const res = await api.get('classes', {
        params: {
          subject,
          week_day,
          time,
        }
      })
  
      if (res === null) { 
        setErrorMessage({
          message: 'Erro, Proffy não encontrado!',
          status: true
        })

        setTimeout(() => {
          setErrorMessage({ message: '', status: false })
        }, 3000)
      }

      setIsFiltersVisible(false)
      setTeachers(res.data)
    } catch(erro) {
      setIsFiltersVisible(false)

      setErrorMessage({
        message: 'Erro, Proffy não encontrado!',
        status: true
      })

      setTimeout(() => {
        setErrorMessage({message: '', status: false})
      }, 3000)
    }
  }

  function handleToggleFiltersVisible() {
    setIsFiltersVisible(!isFiltersVisible)
  }

  return (
    <View style={styles.container}>
      <PageHeader 
        title="Proffys disponíveis" 
        headerRight={(
          <BorderlessButton onPress={handleToggleFiltersVisible}>
            <Feather name="filter" size={20} style={{
              padding: 10
            }} color="#FFF" />
          </BorderlessButton>
        )}
        >
        {isFiltersVisible && (
          <View style={styles.searchForm}>
          <Text style={styles.label}>Máteria</Text>
          <TextInput
            placeholderTextColor='#c1bccc'
            value={subject}
            style={styles.input}
            onChangeText={text => setSubject(text)}
            placeholder="Qual a matéria?"
          />

          <View style={styles.inputGroup}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Dia da semana</Text>
              <TextInput
                placeholderTextColor='#c1bccc'
                value={week_day}
                onChangeText={text => setWeek_day(text)}
                style={styles.input}
                placeholder="Qual o dia?"
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Horário</Text>
              <TextInput
                placeholderTextColor='#c1bccc'
                value={time}
                onChangeText={text => setTime(text)}
                style={styles.input}
                placeholder="Qual o horário?"
              />
            </View>
          </View>

          <RectButton onPress={handleFiltersSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Filtrar</Text>
          </RectButton> 
        </View>
        )}

        <View style={errorMessage.status ? styles.errorContainer : {}}>
          <Text style={styles.errorText}>{errorMessage.message}</Text>
        </View>
      </PageHeader>
    
      <ScrollView
        style={styles.teacherList}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        {teachers.map((teacher: Teacher) => {
          return <TeacherItem 
            key={teacher.id} 
            teacher={teacher}
            favorited={favorites.includes(teacher.id)}
          />
        })}
      </ScrollView>
    </View>
  );
}

export default TeacherList;