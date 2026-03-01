import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { launchImageLibrary } from 'react-native-image-picker';
import Config from 'react-native-config';
const API_URL = Config.API_URL;
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { refreshUser } from '../../redux/actions/user.action';
import i18n from '../locales/i18n';
import SocialIcons from '../components/SocialIcons';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { setPlacesRefresh } from '../../redux/actions/user.action';

export default function PlaceDetailScreen() {
  const [isFavourite, setIsFavourite] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [selectedStar, setSelectedStar] = useState(0);
  const [image, setImage] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);

  const route = useRoute();
  const { id, type } = route.params;
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const allPlaces = useSelector(state => state.places.all);
  const dispatch = useDispatch();

  const place = allPlaces.find(item => item._id === id);

  const starArray = [1, 2, 3, 4, 5];
  const [isGuest, setIsGuest] = useState(false);

  const openImageModal = uri => {
    setSelectedImageUri(uri);
    setImageModalVisible(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImageUri(null);
  };

  const fetchSuggestedPlace = () => {
    if (!place || !place.city) return;
    const city = place.city;
    // const type = place.type;
    const suggestions = allPlaces.filter(
      p => p.city === city && String(p._id) !== String(id),
    );
    setSuggestedPlaces(suggestions);
  };

  const handleFavouriteToggle = async () => {
    const token = await AsyncStorage.getItem('token');

    const newValue = !isFavourite;
    setIsFavourite(newValue);
    try {
      if (newValue) {
        await axios.post(
          `${API_URL}/api/favorite/`,
          { placeId: id },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        await axios.delete(`${API_URL}/api/favorite`, {
          data: { placeId: id },
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      dispatch(refreshUser(user._id)); // Refresh after success
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavourite(newValue);
    }
  };

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const asset = response.assets && response.assets[0];
        if (asset) {
          setImage(asset.uri);
        }
      }
    });
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!selectedStar || !reviewText) {
      Toast.show({
        type: 'error',
        text1: 'Bad',
        text2: 'Please fill in all required fields.',
        position: 'bottom',
        visibilityTime: 5000,
      });
      return;
    }

    try {
      let imageUrl = '';
      // Upload image if selected
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }
      // specific model type
      const staticTypes = ['religious', 'touristic'];
      const modelType = staticTypes.includes(place.type)
        ? 'StaticPlace'
        : 'ClientPlace';
      // Submit review data
      const res = await axios.post(
        `${API_URL}/api/review`,
        {
          rating: selectedStar,
          comment: reviewText,
          image: imageUrl || null,
          placeId: place._id,
          placeModel: modelType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Great',
          text2: 'Review submitted successfully!',
          position: 'top', // optional, default is 'top'
          visibilityTime: 5000, // optional, default 4000 ms
        });
        dispatch(setPlacesRefresh(true));
        setSelectedStar(0);
        setReviewText('');
        setImage(null);
      } else {
        Toast.show({
          type: 'error',
          text1: 'error',
          text2: 'Something went wrong. Please try again..',
          position: 'top',
          visibilityTime: 5000,
        });
      }
    } catch (err) {
      console.error('Submit error:', err);

      Toast.show({
        type: 'error',
        text1: 'Submission failed',
        text2:
          'Submission failed. Please check your network or try again later.',
        position: 'top',
        visibilityTime: 5000,
      });
    }
  };
  useEffect(() => {
    const checkGuest = async () => {
      const guest = await AsyncStorage.getItem('guest');
      if (guest) {
        setIsGuest(true);
      }
    };
    checkGuest();
    fetchSuggestedPlace();
  }, [id, type, allPlaces]);

  useEffect(() => {
    if (user && user.favoritePlaces) {
      const existsInFavorites = user.favoritePlaces.some(fav => fav === id);
      setIsFavourite(existsInFavorites);
    } else {
      setIsFavourite(false);
    }

    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [user, isGuest]);
  //fetching reviews of a specific place
  const fetchReviews = async placeId => {
    const token = await AsyncStorage.getItem('token');

    try {
      const res = await axios.get(`${API_URL}/api/review/place/${placeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const [visibleReviews, setVisibleReviews] = useState(3); // Start by showing 3 reviews
  const [reviews, setReviews] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const loadMoreReviews = () => {
    setVisibleReviews(prev => prev + 3);
  };

  const renderReview = (review, index) => (
    <View key={index} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{
            uri: review?.userId?.profile || 'https://via.placeholder.com/50',
          }}
          style={styles.reviewAvatar}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.reviewerName}>
            {review.userId?.name || review.userId?.username || 'Anonymous'}
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(
              (
                star, // !!! now you have a variable named rating instead of that array
              ) => (
                <Text
                  key={star}
                  style={[
                    styles.star1,
                    star <= review.rating
                      ? styles.filledStar
                      : styles.unfilledStar,
                  ]}
                >
                  ★
                </Text>
              ),
            )}
          </View>
        </View>
      </View>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
      >
        {review?.image && (
          <TouchableOpacity onPress={() => openImageModal(review?.image)}>
            <Image
              source={{ uri: review?.image }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 10,
                marginRight: 20,
              }}
            />
          </TouchableOpacity>
        )}
        <Text style={{ flex: 1, fontSize: 15, color: '#333' }}>
          {review.comment}
        </Text>
      </View>
    </View>
  );

  const openReviewsModal = () => {
    fetchReviews(id);
    setReviewModalVisible(true);
  };
  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo name="chevron-left" size={20} color="#000" />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '90%',
            }}
          >
            <Text style={styles.title}>{place?.name || 'Loading...'}</Text>
            <View style={{ alignItems: 'center' }}>
              {showTooltip && (
                <View style={styles.tooltipContainer}>
                  <Text style={styles.tooltipText}>
                    {i18n.t('tooltipReport')}
                  </Text>
                  <View style={styles.tooltipArrow} />
                </View>
              )}
              <TouchableOpacity
                onPress={async () => {
                  const guest = await AsyncStorage.getItem('guest');

                  if (guest) {
                    Alert.alert(
                      i18n.t('login_required'),
                      i18n.t('login_message'),
                      [
                        { text: i18n.t('cancel'), style: 'cancel' },
                        {
                          text: i18n.t('login'),
                          onPress: () => navigation.navigate('Login'),
                        },
                        {
                          text: i18n.t('signup'),
                          onPress: () => navigation.navigate('Signup'),
                        },
                      ],
                    );
                  } else {
                    navigation.navigate('ReportPlaceScreen', {
                      placeId: id,
                      userId: user._id,
                    });
                  }
                }}
              >
                <MaterialIcons name="report" size={29} color="#FAC75C" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.headerImageContainer}>
          <Image source={{ uri: place?.profile }} style={styles.headerImage} />

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() =>
              navigation.navigate('Map', {
                // locationUrl: place.location || null,
                locationUrl: place.location,
                // 'https://www.google.com/maps/place/Baytna/@34.42762,35.8279711,17z',
              })
            }
          >
            <Text style={styles.mapButtonText}>{i18n.t('ViewOnMap')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={styles.galleryRow}>
            {place?.referenceImages.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.galleryImage}
              />
            ))}
          </View>
        </ScrollView>

        <Text style={styles.sectionTitle}>{i18n.t('Description')}</Text>
        <Text style={styles.descriptionText}>{place?.description}</Text>
        {place?.phone ? (
          <Text style={styles.phoneText}>
            {i18n.t('callus')} : {place?.phone}
          </Text>
        ) : (
          ''
        )}

        <Text style={styles.sectionTitle}>{i18n.t('Visit Us')}</Text>
        {place?.facebook || place?.instagram || place?.menu ? (
          <SocialIcons
            facebookLink={place?.facebook}
            instagramLink={place?.instagram}
            isResto={place?.type === 'restaurant'}
            menuLink={place?.menu}
          />
        ) : (
          ''
        )}

        {/* suggested places */}
        <Text style={styles.sectionTitle}>{i18n.t('SuggestedPlaces')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.suggestedRow}>
            {suggestedPlaces.length > 0 ? (
              suggestedPlaces.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestedCard}
                  onPress={() =>
                    navigation.navigate('PlaceDetails', {
                      id: item._id,
                      type: item.type,
                    })
                  }
                >
                  <Image
                    source={{ uri: item?.profile }}
                    style={styles.suggestedImage}
                  />
                  <Text style={styles.suggestedName}>{item?.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text
                style={{ color: '#555', fontStyle: 'italic', marginLeft: 10 }}
              >
                {i18n.t('noPlacesFoundSameCity')}
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            // onPress={() => handleFavouriteToggle()}
            onPress={async () => {
              const guest = await AsyncStorage.getItem('guest');

              if (guest) {
                Alert.alert(i18n.t('login_required'), i18n.t('login_message'), [
                  { text: i18n.t('cancel'), style: 'cancel' },
                  {
                    text: i18n.t('login'),
                    onPress: () => navigation.navigate('Login'),
                  },
                  {
                    text: i18n.t('signup'),
                    onPress: () => navigation.navigate('Signup'),
                  },
                ]);
              } else {
                handleFavouriteToggle();
              }
            }}
          >
            <Text style={styles.actionText}>{i18n.t('AddToFavourite')}</Text>
            <AntDesign
              name={isFavourite ? 'heart' : 'hearto'}
              size={20}
              color={isFavourite ? '#FAC75C' : 'black'}
              style={{ marginTop: 50 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={openReviewsModal}
          >
            <Text style={styles.actionText}>{i18n.t('RatingAndReview')}</Text>
            <Entypo
              name="chevron-right"
              size={20}
              color="black"
              style={{ marginTop: 50, marginBottom: 30 }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeX}
            >
              <Text style={styles.xText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.profileSection}>
              <Image source={{ uri: place?.profile }} style={styles.avatar} />
              <View>
                <Text style={styles.name}>{place?.name}</Text>
                <Text style={styles.location}>{place?.city} || Tripoli</Text>
              </View>
            </View>

            <Text style={styles.label}>
              {i18n.t('HowWouldYouRateYourExperience')}
            </Text>
            <View style={styles.stars}>
              {starArray.map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedStar(star)}
                >
                  <Text
                    style={[
                      styles.star,
                      star <= selectedStar && styles.filledStar,
                    ]}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput1}
              placeholder={i18n.t('WriteYourReview')}
              multiline
              value={reviewText}
              onChangeText={setReviewText}
              maxLength={200}
            />
            <Text style={styles.charCount}>
              {reviewText.length}
              {i18n.t('CharactersLimit')}
            </Text>

            <Text style={styles.label}>{i18n.t('UploadPhotoOptional')}</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImagePick}
            >
              <Text style={styles.uploadText}>{i18n.t('Upload')}</Text>
            </TouchableOpacity>
            {image && (
              <Image source={{ uri: image }} style={styles.previewImage} />
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveText}>{i18n.t('Save')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>{i18n.t('Submit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Toast />
        </View>
      </Modal>
      {/* Modal Sheet1 */}
      <Modal
        animationType="slide"
        transparent
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setReviewModalVisible(false)}
              style={styles.closeX}
            >
              <Text style={styles.xText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>{i18n.t('UsersReviews')}</Text>
            <ScrollView>
              {reviews.slice(0, visibleReviews).map(renderReview)}

              {visibleReviews < reviews.length && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreReviews}
                >
                  <Text style={styles.loadMoreText}>
                    {i18n.t('LoadMoreReviews')}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={async () => {
                const guest = await AsyncStorage.getItem('guest');

                if (guest) {
                  Alert.alert(
                    i18n.t('login_required'),
                    i18n.t('login_message'),
                    [
                      { text: i18n.t('cancel'), style: 'cancel' },
                      {
                        text: i18n.t('login'),
                        onPress: () => navigation.navigate('Login'),
                      },
                      {
                        text: i18n.t('signup'),
                        onPress: () => navigation.navigate('Signup'),
                      },
                    ],
                  );
                } else {
                  setReviewModalVisible(false);
                  setModalVisible(true);
                }
              }}
            >
              <Text style={{ color: '#333', fontSize: 10 }}>
                {i18n.t('YouAlsoVisited')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.fullscreenImageOverlay}>
          <TouchableOpacity
            style={styles.fullscreenCloseArea}
            onPress={closeImageModal}
          />
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.fullscreenCloseButton}
            onPress={closeImageModal}
          >
            <MaterialIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 20,
  },
  headerImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  headerImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  mapButton: {
    position: 'absolute',
    bottom: 80,
    right: 120,
    backgroundColor: '#FAC75C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  galleryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 6,
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
  },
  phoneText: {
    marginTop: 5,
    fontSize: 14,
    color: '#1f1f1fff',
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 16,
    marginRight: 200,
    marginTop: 10,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    marginTop: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    minHeight: '100%',
  },
  closeX: {
    alignSelf: 'flex-end',
  },
  xText: {
    fontSize: 20,
    color: '#333',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },

  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  location: {
    color: '#666',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 20,
  },
  stars: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  star: {
    fontSize: 54,
    color: '#ccc',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  filledStar: {
    color: '#FAC75C',
  },
  modalInput1: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    height: 100,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    height: 40,
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#888',
    fontSize: 12,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    width: 90,
    marginTop: 20,
    borderWidth: 1,
  },

  uploadText: {
    color: '#333',
  },
  uploadText1: {
    color: '#333',
    padding: 10,
  },
  previewImage: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 120,
  },
  saveButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    flex: 1,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#FAC75C',
    padding: 12,
    borderRadius: 50,
    flex: 1,
    borderWidth: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#333',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#FAC75C',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 10,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  writeReviewLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  writeReviewText: {
    color: '#FAC75C',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

  rating: {
    marginTop: 4,
    color: '#444',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  reviewAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },

  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },

  star1: {
    fontSize: 16,
    marginRight: 2,
  },
  star: {
    fontSize: 54,
    color: '#ccc',
    textAlign: 'center',
    marginHorizontal: 10,
  },

  filledStar: {
    color: '#f1c40f',
  },

  unfilledStar: {
    color: '#ccc',
  },

  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginTop: 10,
  },

  iconRow: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 10,
  },
  icon: {
    padding: 6,
  },
  tooltipContainer: {
    backgroundColor: '#FAC75C',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginBottom: 6,
    position: 'relative',
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    left: '60%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FAC75C',
  },
  fullscreenImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullscreenCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullscreenImage: {
    width: '90%',
    height: '70%',
    borderRadius: 12,
  },
  fullscreenCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  suggestedRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    gap: 10,
  },
  suggestedCard: {
    width: 120,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2, // for Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  suggestedImage: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  suggestedName: {
    padding: 5,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});
