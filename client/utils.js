const generateRandomUser = async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) return JSON.parse(storedUser);
  const response = await fetch('https://randomuser.me/api/');
  const result = await response.json();
  const newUser = {
    id: result.results[0].login.uuid,
    name: result.results[0].name.first,
  };
  localStorage.setItem('user', JSON.stringify(newUser));
  return newUser;
};

const generateBackendUrl = () => {
  const { protocol, host } = window.location;
  if (protocol === 'http:') return `ws://${host}`;
  if (protocol === 'https:') return `wss://${host}`;
  throw new Error('Unknown protocol');
};

const generateMessage = (message, myUser) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add(
    'flex',
    'items-end',
    'px-4',
    'relative',
    'transition-opacity',
    'opacity-0',
    'duration-300',
  );
  const isMyMessage = message.user.id === myUser.id;
  let messageClasses = 'max-w-xs mx-2 px-4 py-3 rounded-lg rounded-br-none';
  let pictureClasses = 'w-6 h-6 rounded-full mx-2 absolute top-1';
  console.log(isMyMessage);
  if (isMyMessage) {
    messageClasses += ' bg-cyan-800 text-white';
    pictureClasses += ' right-1';
    messageElement.classList.add('justify-end');
  } else {
    messageClasses += ' bg-sky-800 text-white';
    pictureClasses += ' left-1';
    messageElement.classList.add('justify-start');
  }
  messageElement.innerHTML = `
      <div class="${messageClasses}">
        <p class="text-sm leading-snug"><span class="font-bold">${message.user.name}</span>: ${message.message}</p>
      </div>
      <img src="https://i.pravatar.cc/40?u=${message.userId}" alt="Profile" class="${pictureClasses}" />
    `;
  return messageElement;
};
