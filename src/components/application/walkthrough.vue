<template>
  <v-layout wrap row ckass="pt-2 pa-4" justify-center>
    <v-flex xs12 md8>
      <v-card style="background: rgba(0,0,0,0.3)" class="pa-4">
        <v-layout row wrap justify-center align-center>
          <v-flex xs12 sm8 lg4>
          </v-flex>
        </v-layout>
          <h1 :style="fontSizes.large" class="center-text pa-4">Loading...</h1>
          <div v-if="!testClient">
            <v-layout wrap row style="position:relative">
              <v-flex xs12 md4 offset-md4>
                <div style="width:100%;text-align:center">
                  <v-progress-circular indeterminate v-bind:size="50" class="amber--text" style="display:inline-block"></v-progress-circular>
                </div>
              </v-flex>
            </v-layout>
          </div>
          <div v-if="testClientErrorMsg" class="text-xs-center error">
            <p>
              Error Loading the SyncedWatch Video Player
            </p>
          </div>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import plexclient from './plexclient';
import joinroom from './joinroom';

import { mapState, mapActions } from 'vuex';

const moment = require('moment');

export default {
  props: ['object'],
  name: 'walkthrough',
  data() {
    return {
      testClient: null,
      testClientErrorMsg: null,
      gotResponse: true,
      e1: '1',
      joinRoomModal: false,
      platformMap: {
        android: 'android',
        'apple tv': 'atv',
        chrome: 'chrome',
        chromecast: 'chromecast',
        dlna: 'dlna',
        firefox: 'firefox',
        'internet explorer': 'ie',
        ios: 'ios',
        ipad: 'ios',
        iphone: 'ios',
        kodi: 'kodi',
        linux: 'linux',
        nexus: 'android',
        macos: 'macos',
        'microsoft edge': 'msedge',
        opera: 'opera',
        osx: 'macos',
        playstation: 'playstation',
        'plex home theater': 'plex',
        'plex media player': 'plex',
        plexamp: 'plexamp',
        plextogether: 'synclounge',
        roku: 'roku',
        safari: 'safari',
        samsung: 'samsung',
        synclounge: 'synclounge',
        tivo: 'tivo',
        tizen: 'samsung',
        tvos: 'atv',
        vizio: 'opera',
        wiiu: 'wiiu',
        windows: 'windows',
        'windows phone': 'wp',
        xbmc: 'xbmc',
        xbox: 'xbox',
      },
    };
  },
  components: {
    plexclient,
    joinroom,
  },
  computed: {
    ...mapState(['plex']),
    doReverse() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return true;
        case 'sm':
          return true;
        default:
          return false;
      }
    },
    chosenClient() {
      return this.$store.getters.getChosenClient;
    },
    isHttps() {
      return location.protocol === 'https:';
    },
    platform() {
      if (!this.testClient || !this.testClient.platform) {
        return;
      }
      return (
        this.platformMap[this.testClient.platform.toLowerCase()] ||
        this.platformMap[this.testClient.product.toLowerCase()]
      );
    },
    platformClass() {
      return [`platform-${this.platform}`];
    },
    url() {
      if (!this.platform) {
        return 'platforms/plex.svg';
      }
      if (this.platform === 'synclounge') {
        return 'platforms/synclounge.png';
      }
      return `platforms/${this.platform}.svg`;
    },
    clients() {
      return this.plex.clients;
    },
    context() {
      return this.$store;
    },
    playercount() {
      if (this.$store.state.plex && this.$store.state.plex.gotDevices) {
        return `(${Object.keys(this.plex.clients).length})`;
      }
      return '';
    },
    nohttpslink() {
      if (!this.isHttps) {
        return '';
      }
      let url = `http:${window.location.href.substring(window.location.protocol.length)}`;
      if (this.$store.state.autoJoin) {
        url = `${url}?server=${this.$store.state.autoJoinUrl}&room=${
          this.$store.state.autoJoinRoom
        }&autojoin=true&owner=${this.$store.state.autoJoinOwner}`;
        if (this.$store.state.autoJoinPassword) {
          url = `${url}&password=${this.$store.state.autoJoinPassword}`;
        }
        url = url.replace('clientselect', 'join');
      }
      return url;
    },
    logo() {
      return this.logos.light.long;
    },
    recentClients() {
      return this.$store.getters.recentClients;
    },
  },
  watch: {
    chosenClient(to, from) {
      if (this.chosenClient && !from) {
        this.$router.push('/joinroom');
      }
    },
  },
  methods: {
    ...mapActions(['PLEX_GET_DEVICES']),
    previewClient(client) {
      this.testClient = client;
      this.testClientErrorMsg = null;
    },
    async clientClicked() {
      const client = this.testClient;
      this.gotResponse = false;
      this.testClientErrorMsg = null;
      this.$store
        .dispatch('PLEX_CLIENT_FINDCONNECTION', client)
        .then(() => {
          this.$store.commit('SET_CHOSENCLIENT', client);
          this.gotResponse = true;
        })
        .catch((e) => {
          if (client.clientIdentifier !== this.testClient.clientIdentifier) {
            return;
          }
          this.gotResponse = true;
          this.testClientErrorMsg = 'Unable to connect to client';
        });
    },
    openJoinRoomModal() {
      return this.$parent.$refs.joinroomModal.open();
    },
    isClientSelected(client) {
      if (client === this.testClient) {
        return true;
      }
      return false;
    },
    lastSeenAgo(clientTime) {
      const now = moment(new Date().getTime());
      const end = moment.unix(parseInt(clientTime));
      const difference = moment.duration(now.diff(end));
      return `${difference.humanize()} ago`;
    },
    refreshPlexDevices() {
      this.$store.commit('SET_CHOSENCLIENT', null);
      this.$store.commit('REFRESH_PLEXDEVICES');
    },
  },
};
</script>
