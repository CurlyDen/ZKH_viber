FROM node as builder
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/

#RUN npm install --global serve
RUN npm i
RUN npm install react-scripts@latest --legacy-peer-deps -S serve
# RUN npm audit fix --force
COPY src /usr/src/app/src
COPY public /usr/src/app/public
COPY index.html /usr/src/app/
COPY *.js /usr/src/app/
RUN npm run build

FROM nginx:1.25.1-bookworm

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN ls -lla /usr/share/nginx/html
EXPOSE 80