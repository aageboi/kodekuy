<template>
  <div>
    <div v-html="name" v-if="userData"></div>
    <div v-else id="firebaseui-auth-container"></div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      userData: null,
    };
  },
  beforeMount: async function () {
    var signedIn = (user) => {
      this.handleSignedInUser(user);
    };
    var signedOut = () => {
      this.$store.commit("SET_USER", false);
    };
    firebase.auth().onAuthStateChanged(
      (user) => {
        user ? signedIn(user) : signedOut();
      },
      function (error) {
        console.log(error);
      }
    );
  },

  methods: {
    handleSignedInUser(user) {
      var displayName = user.displayName;
      var photoURL = user.photoURL;
      var uid = user.uid;
      user.getIdToken().then((accessToken) => {
        var userData = {
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
          // accessToken: accessToken,
        };
        // this.$store.commit("SET_USER", JSON.stringify(userData, null, " "));
        this.$store.commit("SET_USER", userData);
        this.userData = userData;
      });
    },
    signOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },

  mounted: async function () {
    var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          if (authResult.user) {
            this.handleSignedInUser(authResult.user);
          }
          // Do not redirect.
          return false;
        },
        signInFailure: function (error) {
          return handleUIError(error);
        },
        uiShown: function () {},
      },
      signInFlow: "popup",
      signInSuccessUrl: window.location.href,
      signInOptions: [firebase.auth.GithubAuthProvider.PROVIDER_ID],
      tosUrl: "",
      privacyPolicyUrl: function () {
        window.location.assign("https://kodekuy.web.app");
      },
    };
    ui.start("#firebaseui-auth-container", uiConfig);
  },

  computed: {
    name: function () {
      return (
        '<img src="' +
        this.userData.photoURL +
        '" width="100px" height="100px" class="profileImg" /> ' +
        this.userData.displayName
      );
    },
  },
};
</script>

<style>
.profileImg {
  border-radius: 50%;
}
</style>