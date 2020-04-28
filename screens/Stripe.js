import React, { useState } from "react";
import { StyleSheet, Text, View ,ScrollView} from "react-native";
import {
  CreditCardInput,
  LiteCreditCardInput,
} from "react-native-credit-card-input";
import {
  Card,
  ListItem,
  Button,
  Icon,
  Header,
  Overlay,
} from "react-native-elements";
import { connect } from "react-redux";
var stripe = require("stripe-client")(
  "pk_test_ogc5L6lv4iWj8N1lPlGd3wKl00TpkY2uur"
);

function Stripe({ navigation, route, ball, tokenRdx }) {
  const { nom } = route.params;
  const { prenom } = route.params;
  const { adresse } = route.params;
  const { postal } = route.params;
  const { ville } = route.params;
console.log('=======params stripe',nom,prenom,adresse,postal,ville)
  const [cardData, setCardData] = useState({ valid: false });
  const [erreur, setErreur] = useState("");
  var totalCmd = 0;
  var totalQte = 0;

  var ballTab = ball.map((ball, i) => {
    totalCmd = parseInt(ball.price, 10) * parseInt(ball.theQuantite) + totalCmd;
    totalQte = parseInt(ball.theQuantite, 10) + totalQte;

    return (
      <View style={{ flexDirection: "row", marginTop: 10, height: 40 }}>
        <View
          style={{
            flex: 4,
            backgroundColor: "#ededed",
            marginLeft: 10,
            justifyContent: "center",
          }}
        >
          <Text style={{ paddingLeft: 10 }}>
            {ball.brand} {ball.name}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ededed",
            justifyContent: "center",
          }}
        >
          <Text>{ball.thePoids}</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ededed",
            justifyContent: "center",
          }}
        >
          <Text style={{ textAlign: "center" }}>{ball.theQuantite}</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ededed",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ textAlign: "center" }}>{ball.price}€</Text>
        </View>
      </View>
    );
  });
  console.log("========cardData", cardData);

  async function stripeClick() {
    var expiry = cardData.values.expiry;
    var moisExp = expiry.split("/");

    var information = {
      card: {
        number: cardData.values.number,
        exp_month: moisExp[0],
        exp_year: moisExp[1],

        cvc: cardData.values.cvc,
        name: cardData.values.name,
      },
    };

    console.log("=============", moisExp[1]);

    var carte = await stripe.createToken(information);
    var token = carte.id;

    var commandeId = [
      tokenRdx,
      {
        nom: nom,
        prenom: prenom,
        adresse: adresse,
        postal: postal,
        ville: ville,
      },
      { ball: ball },
    ];

    console.log("===========================", commandeId);

    var response = await fetch(`http://192.168.1.115:3000/commande`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, commandeId }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.success === true) {
          console.log("+===========================", data.success);

          navigation.navigate("Confirm", {
            nom: nom,
            prenom: prenom,
            adresse: adresse,
            postal: postal,
            ville: ville,
          });
        } else {
          setErreur("erreur de numéro de carte");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <ScrollView style={{backgroundColor:"white"}}>
    <View style={styles.container}>
      <Text style={{ marginTop: 30 }}>PAIEMENT</Text>
      <Text style={{ color: "red", fontSize: 20 }}>{erreur}</Text>
      <View style={{ flexDirection: "row", height: 40 }}>
        <View
          style={{
            flex: 4,
            backgroundColor: "#ededed",
            marginLeft: 10,
            justifyContent: "center",
          }}
        >
          <Text style={{ paddingLeft: 10 }}>produit</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ededed",
            justifyContent: "center",
          }}
        >
          <Text>poids</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ededed",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>qté</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ededed",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ textAlign: "center" }}>prix</Text>
        </View>
      </View>
      {ballTab}

      <View style={{ flexDirection: "row", marginTop: 10, height: 40 }}>
        <View
          style={{
            flex: 4,
            backgroundColor: "#ededed",
            marginLeft: 10,
            justifyContent: "center",
          }}
        >
          <Text style={{ paddingLeft: 10 }}>total</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ededed",
            justifyContent: "center",
          }}
        >
          <Text></Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ededed",
            justifyContent: "center",
          }}
        >
          <Text style={{ textAlign: "center" }}>{totalQte}</Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ededed",
            marginRight: 10,
            justifyContent: "center",
          }}
        >
          <Text style={{ textAlign: "center" }}>{totalCmd}€</Text>
        </View>
      </View>
      <View style={{ flex: 1, marginTop: 30 }}>
        <CreditCardInput
          placeholderColor={"silver"}
          placeholders={{
            number: "1234 5678 1234 5678",
            expiry: "MM/YY",
            cvc: "CVC",
            name: "NOM",
          }}
          labels={{
            number: "N° DE CARTE",
            expiry: "EXP",
            cvc: "CVC",
            name: "NOM",
            brand: "VISA",
          }}
          // cardImageFront={require("../assets/homePage.jpeg")}

          requiresName
          onChange={(e) => setCardData(e)}
        />
      </View>
      <Button
        title="Paiement"
        containerStyle={{
          alignItems: "center",
          marginTop: 20,
          marginBottom: 20,
        }}
        buttonStyle={{ backgroundColor: "orange" }}
        onPress={() => stripeClick()}
      ></Button>
     </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});
function mapStateToProps(state) {
  return { ball: state.panier, tokenRdx: state.token };
}

export default connect(mapStateToProps, null)(Stripe);
