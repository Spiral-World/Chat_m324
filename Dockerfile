# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY . .

# Install the dependencies
RUN yarn

# Compile the code to nodejs
RUN ./node_modules/.bin/tsc

# port on which the server will get called
EXPOSE 3000

# Start the server when the container starts
ENTRYPOINT ["node", "./build/index.js"]
