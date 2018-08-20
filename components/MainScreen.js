import React, { Component } from 'react';
import { MapView, Location, Permissions } from 'expo';
import {  StyleSheet, View, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import firestore from '../firestore';
import { Marker } from 'react-native-maps';
import { firebase } from '@firebase/app';

class MainScreen extends Component {

  state = {
    location: null,
    errorMessage: null,
    marker: { latitude: null, longitude: null },
		showLot: false,
		showBid: false,
		offer: '',
		driverId: ''
  }

	async componentDidMount() {
		let driver = '';
		let id;

		const passengerEmail = firebase.auth().currentUser.email;
		await firestore.collection('users').where('email',
		'==', passengerEmail).get()
		.then(users => {
			users.forEach(user => {
				id = user.id;
			});
		});
		this._getLocationAsync();
		await firestore.collection('lots').onSnapshot( allLots => {

      allLots.docChanges().forEach(lot => {
						driver = lot.doc.data().driverId;
						//Not sure if needs another if statement but bid info should not changed unless its another bid
						if (lot.doc.data().passengerId === id && lot.doc.data().driverId !== null) {
							this.setState({showBid: true, offer: lot.doc.data().offer, driverId: driver });
						}
      });
		});
	}

	_getLocationAsync = async () => {
		let { status } = await Permissions.askAsync(Permissions.LOCATION);
		if (status !== 'granted') {
			this.setState({
				errorMessage: 'Permission to access location was denied',
			});
		}

		let location = await Location.getCurrentPositionAsync({});
		this.setState({ location });
	};

  handleSubmit = async () => {
		this.props.navigation.navigate('LotSubmissionForm');
	}

	handleMatch = async () => {
		this.setState({showBid: false});
	}

	handleCancel = async () => {
		this.setState({showBid: false});
	}

  render(){
    const { marker, showBid, driverId, offer} = this.state;
    return(
      <View style={styles.container}>
      <MapView style={styles.map}
        onRegionChangeComplete={this.onRegionChangeComplete}
        showsUserLocation={true}
        followsUserLocation={true}
        onRegionChangeComplete={this.onRegionChangeComplete}>
        {marker.latitude ? <Marker
          coordinate={marker}
        /> : null}
			</MapView>

					{showBid ? Alert.alert(
						`New Bid! ${driverId} has bid ${offer}!`,
						'Sound Good?',
						[
							{ text: 'Yes!', onPress: () => this.handleMatch(), style: 'cancel' },
							{ text: 'Cancel', onPress: () => this.handleCancel(), style: 'cancel' }
						],
						{ cancelable: false }
					) : null}

			<Button
						title="Where to?"
						style={styles.button}
						backgroundColor='white'
						color='grey'
						onPress={this.handleSubmit} />

		</View>
		)
	}
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    flex: 1
	},
	lot: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: 'black'
	},

	scrollview: {
		alignItems: 'center',
	},

	map: {
		zIndex: -1,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		flex: 1,
	},

	button: {
		zIndex: 10,
		top: 70
	}
});

export default MainScreen;
