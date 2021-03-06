import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, ScrollView, Alert} from 'react-native';
import {
  List,
  Searchbar,
  Button,
  Modal,
  Portal,
  Provider,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import TitleBar from '../../components/TitleBar/TitleBar';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';

function MedicineList({navigation}) {
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  const [visible, setVisible] = useState(false);
  const [medicineList, setMedicineList] = useState();
  const [selectedItem, setSelectedItem] = useState();

  const onChangeSearch = query => {
    setSearchQuery(query);
  };

  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    setExpanded(!expanded);
  };

  const showModal = item => {
    setVisible(true);
    setSelectedItem(item);
    console.log(item);
  };
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20};

  const moveScreen = path => {
    navigation.navigate(path);
  };

  const printDate = source => {
    const date = new Date(source.seconds * 1000);
    let tempYear_s = date.getFullYear();
    let tempMonth_s = date.getMonth() + 1;
    let tempDate_s = date.getDate();
    let parsingDate_s = `${tempYear_s}-${
      tempMonth_s >= 10 ? tempMonth_s : '0' + tempMonth_s
    }-${tempDate_s >= 10 ? tempDate_s : '0' + tempDate_s}`;

    return parsingDate_s;
  };

  const printTime = source => {
    let tmp = [];
    source.forEach((value, index, source) => {
      const cur = new Date(value.seconds * 1000);
      var hours = ('0' + cur.getHours()).slice(-2);
      var minutes = ('0' + cur.getMinutes()).slice(-2);

      var timeString = hours + ':' + minutes;
      tmp.push(timeString);
    });
    return tmp;
  };

  const getTypeName = item => {
    switch (item) {
      case 'pill':
        return '??????';
      case 'powdered_medicine':
        return '?????????';
      case 'capsule':
        return '?????????';
      case 'liquid_medicine':
        return '??????';
      case 'oral_decomposition_film':
        return '??????????????????';
    }
  };

  const onPressModifyBtn = item => {
    navigation.navigate('EditMedicine', {
      param: item,
    });
  };

  const onPressDeleteConfirm = () => {
    auth().onAuthStateChanged(user => {
      firestore()
        .collection('Users')
        .doc(user.uid)
        .collection('pillList')
        .doc(selectedItem.name)
        .delete()
        .then(() => {
          setVisible(false);
          Alert.alert('?????????????????????.');
          navigation.reset({index: 0, routes: [{name: 'List'}]});
        });
    });
  };

  useEffect(() => {
    let tmp = [];
    auth().onAuthStateChanged(user => {
      firestore()
        .collection('Users')
        .doc(user.uid)
        .collection('pillList')
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(documentSnapshot => {
            tmp.push(documentSnapshot.data());
          });
        })
        .then(() => {
          tmp && setMedicineList(tmp.reverse());
        });
    });
  }, [searchQuery]);

  useEffect(() => {
    let tmp = [];
    auth().onAuthStateChanged(user => {
      firestore()
        .collection('Users')
        .doc(user.uid)
        .collection('pillList')
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(documentSnapshot => {
            tmp.push(documentSnapshot.data());
          });
        })
        .then(() => {
          tmp && setMedicineList(tmp.reverse());
        });
    });
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.titleBar}>
          <TitleBar
            title="?????? ?????? ???"
            subtitle="?????? ?????? ?????? ????????????, ?????? ?????? ????????? ???????????????."
          />
        </View>
        <List.Section>
          <Searchbar
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#8AB5E6"
            placeholder="?????? ?????? ?????? ??? ??????"
          />
          {medicineList ? (
            medicineList
              .filter(item => {
                if (searchQuery === '' || searchQuery === undefined) {
                  return item;
                } else if (item.name.includes(searchQuery)) {
                  return item;
                }
              })
              .map((item, idx) => {
                return (
                  <List.Accordion
                    title={item.name}
                    left={props => (
                      <Ionicons
                        {...props}
                        name="bandage-outline"
                        style={styles.iconDesign}></Ionicons>
                    )}
                    onPress={handlePress}
                    style={{color: '#8AB5E6'}}
                    key={idx}>
                    <List.Item
                      title={() => (
                        <View style={{marginTop: -10}}>
                          <Text style={styles.listItem}>
                            ??? ?????? : {getTypeName(item.type)}
                          </Text>
                          <Text style={styles.listItem}>
                            ?????? ?????? : {printDate(item.startDate)}
                          </Text>
                          <Text style={styles.listItem}>
                            ?????? ?????? : {printDate(item.endDate)}
                          </Text>
                          <Text style={styles.listItem}>
                            ?????? ?????? : {item.cycle}???
                          </Text>
                          <Text style={styles.listItem}>
                            ?????? ?????? : {item.count}??? / ???
                          </Text>
                          <Text style={styles.listItem}>
                            ?????? ?????? :{' '}
                            {printTime(item.periods).map((time, index) => (
                              <Text key={index}>
                                {time}
                                {'  '}
                              </Text>
                            ))}
                          </Text>
                          <View style={styles.modifyBtn}>
                            <Text>
                              <Button
                                mode="text"
                                color="#8AB5E6"
                                onPress={() => onPressModifyBtn(item)}>
                                ??????
                              </Button>
                              <Button
                                mode="text"
                                color="#8AB5E6"
                                onPress={() => showModal(item)}>
                                ??????
                              </Button>
                            </Text>
                          </View>
                        </View>
                      )}
                    />
                  </List.Accordion>
                );
              })
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                paddingTop: 140,
              }}>
              <ActivityIndicator size="large" color="#85DEDC" />
            </View>
          )}
        </List.Section>
      </ScrollView>
      <Provider>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}
            style={styles.modalStyle}>
            <Text style={{padding: 20}}>????????? ?????? ?????????????????????????</Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text>
                <Button
                  mode="text"
                  color="#8AB5E6"
                  onPress={() => onPressDeleteConfirm()}>
                  ???
                </Button>{' '}
                <Button
                  mode="text"
                  color="#8AB5E6"
                  onPress={() => setVisible(false)}>
                  ?????????
                </Button>
              </Text>
            </View>
          </Modal>
        </Portal>
      </Provider>
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => moveScreen('AddMedicine')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  titleBar: {
    marginLeft: 30,
    marginRight: 30,
  },

  searchBar: {
    width: '94%',
    margin: 10,
    marginBottom: 20,
  },

  listItem: {
    marginBottom: 20,
  },

  listItemButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 50,
  },

  modalStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#85DEDC',
  },

  modifyBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 50,
  },

  iconDesign: {
    fontSize: 20,
    marginLeft: 10,
    marginRight: 5,
  },
});

export default MedicineList;
