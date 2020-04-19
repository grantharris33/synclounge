<template>
    <v-layout row wrap justify-center>
      <v-flex xs12 lg10 style="background: rgba(0,0,0,0.1); border-radius: 10px" class="pa-4">
        <v-layout row wrap justify-center>
          <v-flex xs12 md8 lg4 xl6>
            <img style="width:100%" v-bind:src="logo" />
          </v-flex>
        </v-layout>
        <v-layout row wrap justify-center>
          <v-flex xs12 class="ml-4">
            <h2 class="text-xs-left">Connect to a SyncedWatch room</h2>
          </v-flex>
            <v-flex xs12 class="ml-4">
              <p>It's time to connect to the SyncedWatch Room. Please enter your username and the room name and password that was given to you by your teacher.</p>
            </v-flex>
          <v-flex xs12 v-if="context.getters.getConnected" class="text-xs-center">
            <v-layout row wrap>
              <v-flex xs12 md6 offset-md3>
                <v-text-field
                  origin="center center"
                  :maxlength="25"
                  :autofocus="true"
                  v-on:keyup.enter.native="joinRoom()"
                  label="Display Name"
                  v-model="ALTUSERNAME"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6 offset-md3>
                <v-text-field
                  origin="center center"
                  :maxlength="25"
                  name="input-2"
                  label="Room name"
                  v-on:keyup.enter.native="joinRoom()"
                  v-model="room"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6 offset-md3>
                <v-text-field
                  transition="v-scale-transition"
                  origin="center center"
                  name="input-2"
                  label="Room password"
                  v-on:keyup.enter.native="joinRoom()"
                  v-model="password"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6 offset-md3>
                <v-btn block color="primary" v-on:click.native="joinRoom()">Join</v-btn>
              </v-flex>
              <v-layout class="pt-3 text-xs-center" row wrap v-if="roomError">
                <v-flex xs12 class="red--text">
                  <v-icon class="red--text">info</v-icon>
                  {{ roomError }}
                </v-flex>
              </v-layout>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
</template>

<script>
import Vue from 'vue';

const axios = require('axios');

export default {
  props: ['object'],
  name: 'joinroom',
  data() {
    return {
      selectedServer: '',
      serverError: null,
      roomError: null,
      room: '',
      e1: 2,
      password: '',
      connectionPending: false,
      thisServer: window.location.origin,
      recents: null,

      results: {},

      destroyed: false,
    };
  },
  mounted() {
    setTimeout(() => {
      this.testConnections();
      const ticker = setInterval(() => {
        if (this.destroyed) {
          return clearInterval(ticker);
        }
        this.testConnections();
      }, 5000);
    }, 1500);
  },
  beforeDestroy() {
    this.destroyed = true;
  },
  created() {
    if (this.slRoom && this.slConnected && this.slServer) {
      this.$router.push('/browse');
    }
    this.getRecents();
  },
  methods: {
    getRecents() {
      this.recents = JSON.parse(window.localStorage.getItem('recentrooms'));
    },
    removeHistoryItem(item) {
      const recents = JSON.parse(window.localStorage.getItem('recentrooms'));
      delete recents[`${item.server}/${item.room}`];
      window.localStorage.setItem('recentrooms', JSON.stringify(recents));
      return this.getRecents();
    },
    connectionQualityClass(value) {
      if (value < 50) {
        return ['green--text', 'text--lighten-1'];
      }
      if (value < 150) {
        return ['lime--text'];
      }
      if (value < 250) {
        return ['orange--text'];
      }
      return ['red--text'];
    },
    loadQualityClass(value) {
      if (value === 'low') {
        return ['green--text', 'text--lighten-1'];
      }
      if (value === 'medium') {
        return ['orange--text'];
      }
      if (value === 'high') {
        return ['red--text'];
      }
      return ['white--text'];
    },
    serverSelected(server) {
      this.selectedServer = server;
      if (this.selectedServer.defaultRoom) {
        this.room = this.selectedServer.defaultRoom;

        if (this.selectedServer.defaultPassword) {
          this.password = this.selectedServer.defaultPassword;
        }
      }
      if (this.selectedServer.url !== 'custom') {
        this.attemptConnect();
      }
    },
    async testConnections() {
      this.ptservers.map((server) => {
        if (server.url !== 'custom') {
          const start = new Date().getTime();
          axios
            .get(`${server.url}/health`)
            .then((res) => {
              Vue.set(this.results, server.url, {
                alive: true,
                latency: Math.abs(start - new Date().getTime()),
                result: res.data.load || null,
              });
            })
            .catch((e) => {
              Vue.set(this.results, server.url, {
                alive: false,
                latency: Math.abs(start - new Date().getTime()),
                result: null,
              });
            });
        }
      });
    },
    attemptConnect() {
      // Attempt the connection
      return new Promise((resolve, reject) => {
        this.serverError = null;
        if (this.selectedServer.url !== 'custom') {
          this.connectionPending = true;
          this.$store
            .dispatch('socketConnect', { address: this.selectedServer.url })
            .then((result) => {
              this.connectionPending = false;
              if (result) {
                if (this.room) {
                  this.joinRoom()
                    .then(() => {})
                    .catch((e) => {});
                }
                resolve();
              } else {
                this.serverError = null;
                reject(result);
              }
            })
            .catch((e) => {
              this.connectionPending = false;
              this.serverError = `Failed to connect to ${this.selectedServer.url}`;
              reject(e);
            });
        } else {
          reject(new Error('Custom error: wrong function'));
        }
      });
    },
    attemptConnectCustom() {
      this.connectionPending = true;
      this.serverError = null;
      this.$store
        .dispatch('socketConnect', { address: this.CUSTOMSERVER })
        .then((result) => {
          this.connectionPending = false;
          if (result) {
            this.serverError = `Failed to connect to ${this.CUSTOMSERVER}`;
          } else {
            this.serverError = null;
          }
        })
        .catch(() => {
          this.connectionPending = false;
          this.serverError = `Failed to connect to ${this.CUSTOMSERVER}`;
        });
    },
    async recentConnect(recent) {
      console.log('Attempting to connect to', recent);
      this.selectedServer = {
        url: recent.server,
      };
      this.room = recent.room;
      this.password = recent.password;
      await this.attemptConnect();
    },
    async joinRoom() {
      if (!this.context.getters.getConnected) {
        throw new Error('not connected to a server');
      }
      if (this.room === '' || this.room == null) {
        this.roomError = 'You must enter a room name!';
        throw new Error('no room specified');
      }
      try {
        await this.$store.dispatch('joinRoom', {
          user: this.plex.user,
          roomName: this.room,
          password: this.password,
        });
      } catch (e) {
        this.roomError = e;
        throw e;
      }
    },
  },
  watch: {
    selectedServer() {
      // this.attemptConnect()
      this.serverError = null;
    },
    slRoom() {
      if (this.slServer && this.slRoom) {
        this.$router.push('/browse');
      }
    },
  },
  computed: {
    plex() {
      return this.$store.state.plex;
    },
    logo() {
      return this.logos.light.long;
    },
    context() {
      return this.$store;
    },
    recentsSorted() {
      if (!this.recents) {
        return [];
      }
      let arr = [];
      for (const i in this.recents) {
        const item = this.recents[i];
        arr.push(item);
      }
      arr = arr.sort((a, b) => b.time - a.time);
      if (arr.length > 3) {
        return arr.slice(0, 3);
      }
      return arr;
    },
    ALTUSERNAME: {
      get() {
        return this.$store.getters.getSettings.ALTUSERNAME;
      },
      set(value) {
        this.$store.commit('setSetting', ['ALTUSERNAME', value]);
      },
    },
    CUSTOMSERVER: {
      get() {
        if (!this.$store.getters.getSettings.CUSTOMSERVER) {
          return 'http://';
        }
        return this.$store.getters.getSettings.CUSTOMSERVER;
      },
      set(value) {
        this.$store.commit('setSetting', ['CUSTOMSERVER', value]);
      },
    },
    ptservers() {
      if (typeof this.$store.getters.getSettings.SERVERS === 'string') {
        return JSON.parse(this.$store.getters.getSettings.SERVERS);
      }
      return this.$store.getters.getSettings.SERVERS;
    },
  },
};
</script>
<style>

</style>
