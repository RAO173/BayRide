import React, { Component } from 'react';
import { Text, View, ScrollView, Alert } from 'react-native';
import { store, auth } from '../fire';
import LotBannerWrapper from './LotBannerWrapper';
import Winner from './Winner';
import { Permissions, Location } from 'expo';
import style from '../public/style';
import Icon from 'react-native-vector-icons/Octicons';

export default class DriverHome extends Component {

  state = {
    allLots: [],
    winneringId: ''
  }

  async componentDidMount () {
    // This will need to be trimmed down. IE, only show trips that are close
    // Later, we'll need to have it only show lots with a nearby starting point.
    // We'll also need to have something that show's if they have a bid already in place (I think maybe that banner could be outlined in green).
    // Much much later, we could worry about things like throttling and maybe more complicated sorting algos.

    this._getLocationAsync();

    store.collection("lots").get().then(allLots => {
      allLots.forEach(lot => {
        this.setState({ allLots: [...this.state.allLots, { ...lot.data(), lotId: lot.id } ] })
      });
    });

    /**
     * So what this means is that Winning can only happen if the component mounts
     */
    await store.collection('lot_history').where('driverId', '==', auth.currentUser.email).get().then(lots => {
      lots.forEach(lot => {
        this.setState({ winningId: lot.id });
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

  render(){
    return(
      <View>
        <Icon
          style={style.drawerIcon}
          name='three-bars' 
          size={30} 
          color='#000' 
          onPress={() => this.props.navigation.toggleDrawer()}
        />
        <ScrollView>
          <View>
            {this.state.allLots.map((lot, i) => {
              return <LotBannerWrapper key={i} lotData={lot} />;
            })}
            {/* { this.state.winner ? <Winner winningInfo={this.state.winningInfo} /> : null } */}
            {this.state.winningId ? Alert.alert(
              `You Won!!`,
              'Please click here to begin your trip',
              [
                { text: 'Awesome!', onPress: () => {
                  this.props.navigation.navigate('Winner', {
                    // Passing the lotId of the winning lot as props to Winner.js
                    lotId: this.state.winningId
                  })
                }, style: 'cancel' }
              ],
              { cancelable: false }
            ) : null}
          </View>
        </ScrollView>
      </View>
    );
  }
}
