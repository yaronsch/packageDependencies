FROM node:12.14-alpine
ADD ./ ./app
WORKDIR app
RUN npm i
EXPOSE 3000
CMD ["npm", "start"]
