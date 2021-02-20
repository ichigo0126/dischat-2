<template>
  <div id="app">
    <nav class="navbar navbar-dark bg-info">
      <a class="navbar-brand" href="#">Vue chat</a>
      <!-- ログイン時にはフォームとログアウトボタンを表示 -->
      <div v-if="user.uid" key="login">
        {{ user.displayName }}
        <button type="button" @click="doLogout">logout</button>
      </div>
      <!-- 未ログイン時にはログインボタンを表示 -->
      <div v-else key="logout">
        <button type="button" @click="doLogin">login</button>
      </div>
    </nav>

    <transition-group name="chat" tag="div" class="list content">
      <section v-for="item in chat" :key="item.id" class="item">
        <div class="item-detail">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-message">
            <nl2br tag="div" :text="item.message" />
          </div>
        </div>
      </section>
    </transition-group>

    <main class="row">
      <div class="channels-container col-md-2">
        <h3>Channels</h3>
        <div class="channels">
          <b-tabs pills card vertical class="list">
            <b-tab title="#Genenarl"></b-tab>
            <b-tab title="#Weapons"></b-tab>
            <b-tab title="#Combat"></b-tab>
          </b-tabs>
        </div>
      </div>

      <div class="messages col-md-8">
        <h3>Messages</h3>
        <div class="chats">
          <div class="chat">
            <div class="talk-history">
              <p>John Wick</p>
              <div class="comment">
                <p>Free free to talk about anything here</p>
              </div>
            </div>
            <div class="talk-addres">
              <p>@john</p>
              <div class="talk-time">
                <p>11:49:32 pm 16-12-2018</p>
              </div>
            </div>
          </div>
        </div>
        <div class="send">
          <div>
            <p class="m-0">@john</p>
            <!-- <input
              type="text"
              class="form-control"
              placeholder="Enter Message"
            /> -->
          </div>

          <form action="" @submit.prevent="doSend" class="form">
            <textarea
              v-model="input"
              :disabled="!user.uid"
              @keydown.enter.exact.prevent="doSend"
              type="text"
              class="form-control"
              placeholder="Enter Message"
            ></textarea>
            <button
              type="submit"
              :disabled="!user.uid"
              class="btn btn-primary float-right mt-3"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      <div class="members col-md-2">
        <h3>Members</h3>
        <b-tabs pills card vertical>
          <b-tab title="john Wick"></b-tab>
          <b-tab title="Ethan Hunt"></b-tab>
          <b-tab title="Evelyn Salt"></b-tab>
        </b-tabs>
      </div>
    </main>
  </div>
</template>

<script>
import firebase from "firebase";
import Nl2br from "vue-nl2br";
export default {
  components: { Nl2br },
  data() {
    return {
      user: {},
      chat: [],
      input: "",
    };
  },

  created() {
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user ? user : {};
      const db = firebase.firestore();
      const collection = db.collection("messages");
      if (user) {
        // onSnapshotは監視させるメソッド
        // snapshotはファイルかディレクトリの集合
        // チャットの履歴をデータを取ってくる
        //collectionはフォルダでdocumentはファイル
        //onSnapshotはfirestoreのドキュメントを監視している
        //sendボタンを押したときに、documentにデータを追加したとき、onSnapshotで発火
        collection.orderBy("created").onSnapshot((snapshot) => {
          this.chat = [];
          snapshot.forEach((doc) => {
            this.chat.push(Object.assign({ id: doc.id }, doc.data()));
          });
          console.log(this.chat);
        });
      }
    });
  },

  methods: {
    doLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },

    doLogout() {
      firebase.auth().signOut();
    },

    doSend() {
      const db = firebase.firestore();
      const collection = db.collection("messages");
      if (this.input === "") {
        return;
      }

      collection
        .add({
          message: this.input,
          name: this.user.displayName,

          created: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then((doc) => {
          console.log(`${doc.id} added!`);
          this.input = "";
        });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  overflow: hidden;
}
.card-header {
  background-color: white !important;
}
.row {
  margin-top: 20px;
  height: 100%;
}
h3 {
  margin-left: 10px;
  border-bottom: 1px solid;
  padding-bottom: 10px;
}
.chats {
  height: 75%;
  overflow-y: scroll;
}
.send {
  height: 5%;
}
.send p {
  color: gray;
}
.name {
  display: flex;
  justify-content: space-between;
}
.chat {
  display: flex;
  justify-content: space-between;
  border: 2px solid lightblue;
  padding: 0 3px;
}
.talk-fistory {
  display: flex;
  flex-direction: column;
}
.talk-addres {
  display: flex;
  flex-direction: column;
  color: gray;
}
.talk-time {
  margin-top: 16px;
}
.comment {
  color: gray;
}
.form-control {
  resize: none;
  
}
</style>
