const doctorForm = document.getElementById("doctorForm");
const patientForm = document.getElementById('patientForm');
const connectForm = document.getElementById("room-connect-form");
const patientVsdoctor = document.getElementById('patientVsdoctor');
const selfView = document.getElementById('selfView');
const selfViewText = document.getElementById('selfViewText');
const welcomeText = document.getElementById('welcomeText');
const daenteLogo = document.getElementById('daenteLogo');
const patientScreen = document.getElementById('patientScreen');
const doctorScreen = document.getElementById('doctorScreen');
const roomPromptText = document.getElementById('roomPromptText');
const patContainer = document.getElementById('patContainer');
const docContainer = document.getElementById('docContainer');
const stopVideo = document.getElementById('stopVid');

const getPasscode = () => {
  return 'LSU22';
};

const trackSubscribed = (div, track) => {
  div.appendChild(track.attach());
};

const trackUnsubscribed = (track) => {
  track.detach().forEach((element) => element.remove());
};

const docParticipantConnected = (participant) => {
  console.log(`Participant ${participant.identity} connected'`);
  const participantDiv = document.createElement('div');
  participantDiv.setAttribute('id', participant.sid);
  participantDiv.setAttribute('class', 'docParticipant');

  const tracksDiv = document.createElement('div');
  participantDiv.appendChild(tracksDiv);

  docContainer.appendChild(participantDiv);

  participant.tracks.forEach(publication => {
    if (publication.isSubscribed) {
      trackSubscribed(tracks_div, publication.track);
    }
  });
  participant.on('trackSubscribed', track => trackSubscribed(tracksDiv, track));
  participant.on('trackUnsubscribed', trackUnsubscribed);
};

const patParticipantConnected = (participant) => {
  console.log(`Participant ${participant.identity} connected'`);
  const participantDiv = document.createElement('div');
  participantDiv.setAttribute('id', participant.sid);
  participantDiv.setAttribute('class', 'patParticipant');

  const tracksDiv = document.createElement('div');
  participantDiv.appendChild(tracksDiv);

  patContainer.appendChild(participantDiv);

  participant.tracks.forEach(publication => {
    if (publication.isSubscribed) {
      trackSubscribed(tracks_div, publication.track);
    }
  });
  participant.on('trackSubscribed', track => trackSubscribed(tracksDiv, track));
  participant.on('trackUnsubscribed', trackUnsubscribed);
};

const participantDisconnected = (participant) => {
  console.log(`Participant ${participant.identity} disconnected.`);
  document.getElementById(participant.sid).remove();
};

(() => {
  const { Video } = Twilio;
  let videoRoom;
  const video = document.getElementById('video');

  // preview screen
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((vid) => {
      video.srcObject = vid;
    });
  
  const docButton = document.getElementById('doctor-screen-button');
  const patButton = document.getElementById('patient-screen-button');
  const leaveRoomButton = document.getElementById('button-leave');
  const postConnectControls = document.getElementById('post-connect-controls');

  const docScreen = (event) => {
    event.preventDefault();
    docButton.style.display = 'none';
    patButton.style.display = 'none';
    doctorScreen.style.display = 'block';
    const docVideo = document.getElementById('docVideo');
    video.style.display = 'none';
    selfView.style.display = 'none';
    daenteLogo.style.display = 'none';
    welcomeText.style.display = 'none';
    selfViewText.style.display = 'none';
    roomPromptText.style.display = 'none';
    navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((vid) => {
      docVideo.srcObject = vid;
    });
    fetch(`video-token?passcode=${getPasscode()}`)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      console.error(resp);
      if (resp.status === 401) {
        throw new Error('Invalid passcode');
      } else {
        throw new Error('Unexpected error. Open dev tools for logs');
      }
    })
    .then((body) => {
      const { token, room } = body;
      console.log(token);
      // connect to room
      return Video.connect(token, { name: room });
    })
    .then((room) => {
      console.log(`Connected to Room ${room.name}`);
      videoRoom = room;

      room.participants.forEach(patParticipantConnected);
      room.on('participantConnected', patParticipantConnected);

      room.on('participantDisconnected', participantDisconnected);
      room.once('disconnected', (_error) =>
        room.participants.forEach(participantDisconnected)
      );
      postConnectControls.style.display = 'block';
      patContainer.style.display = 'flex';
    })
    .catch((err) => {
      // eslint-disable-next-line no-alert
      alert(err.message);
    });
};

  const patScreen = (event) => {
    event.preventDefault();
    docButton.style.display = 'none';
    patButton.style.display = 'none';
    patientScreen.style.display = 'block';
    video.style.display = 'none';
    selfView.style.display = 'none';
    daenteLogo.style.display = 'none';
    welcomeText.style.display = 'none';
    selfViewText.style.display = 'none';
    roomPromptText.style.display = 'none';
    const patVideo = document.getElementById('patVideo');
    navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((vid) => {
      patVideo.srcObject = vid;
    });
    fetch(`video-token?passcode=${getPasscode()}`)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      console.error(resp);
      if (resp.status === 401) {
        throw new Error('Invalid passcode');
      } else {
        throw new Error('Unexpected error. Open dev tools for logs');
      }
    })
    .then((body) => {
      const { token, room } = body;
      console.log(token);
      // connect to room
      return Video.connect(token, { name: room });
    })
    .then((room) => {
      console.log(`Connected to Room ${room.name}`);
      videoRoom = room;

      room.participants.forEach(docParticipantConnected);
      room.on('participantConnected', docParticipantConnected);

      room.on('participantDisconnected', participantDisconnected);
      room.once('disconnected', (_error) =>
        room.participants.forEach(participantDisconnected)
      );
      postConnectControls.style.display = 'block';
      docContainer.style.display = 'flex'; 
    })
    .catch((err) => {
      // eslint-disable-next-line no-alert
      alert(err.message);
    });
};

  patientForm.onsubmit = patScreen;
  doctorForm.onsubmit = docScreen;
  patButton.onclick = patScreen;
  docButton.onclick = docScreen;

  // leave room
  const leaveRoom = (event) => {
    videoRoom.disconnect();
    console.log(`Disconnected from Room ${videoRoom.name}`);
    welcomeText.style.display = 'block';
    daenteLogo.style.display = 'block';
    roomPromptText.style.display = 'block';
    selfView.style.display = 'block';
    selfViewText.style.display = 'block';
    permissionsHelp.style.display = 'block';
    postConnectControls.style.display = 'none';
    patContainer.style.display = 'none';
    docContainer.style.display = 'none';
    patientScreen.style.display = 'none';
    doctorScreen.style.display = 'none';
    event.preventDefault();
  };

  leaveRoomButton.onclick = leaveRoom;
  leaveRoomButton.addEventListener("submit", leaveRoom);
  postConnectControls.addEventListener("submit", leaveRoom);
  

})();

addLocalVideo();

