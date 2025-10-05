"use client";

import { Client, Account, Models, ID, Databases, Storage, Permission, Role } from "appwrite";
import { User } from "./interface";

interface Sponsors {
  id: number;
  name: string;
  url: string;
}
// Server-side collection helpers should live on the server (API routes). Keep a minimal placeholder here
class ServerConfig {
  // NOTE: This class is a placeholder to avoid importing server-only SDK into the client bundle.
  // If you need to create collections or attributes, implement those operations in a server API
  // using the Node Appwrite SDK and call them from the client.
  constructor() {}
  // Server-only methods were intentionally removed from the client bundle.
}

class AppwriteConfig {
  databaseId: string = `${process.env.NEXT_PUBLIC_DATABASEID}`;
  activeCollId: string = `${process.env.NEXT_PUBLIC_EVENT_COLLID}`;
  bannerBucketId: string = `${process.env.NEXT_PUBLIC_EVENTBUCKET}`;
  regDbId: string = `${process.env.NEXT_PUBLIC_REGDB}`;

  client: Client = new Client();
  account: Account = new Account(this.client);
  databases: Databases = new Databases(this.client);
  regDb: Databases = new Databases(this.client);
  storage: Storage = new Storage(this.client);
  user: User = {} as User;

  constructor() {
    this.client
      .setEndpoint(`${process.env.NEXT_PUBLIC_ENDPOINT}`)
      .setProject(`${process.env.NEXT_PUBLIC_PROJECTID}`);
  }

  googlelog(): void {
    try {
      const promise = this.account.createOAuth2Session(
        "google",
        `${process.env.NEXT_PUBLIC_APPURL}/login/sucess`,
        `${process.env.NEXT_PUBLIC_APPURL}/login/failure`,
        []
      );
      this.getCurUser();
    } catch (error) {
      console.log(error);
    }
  }

  githublog(): void {
    try {
      this.account.createOAuth2Session(
        "github",
        `${process.env.NEXT_PUBLIC_APPURL}/login/sucess`,
        `${process.env.NEXT_PUBLIC_APPURL}/login/failure`,
        []
      );
      this.getCurUser();
    } catch (error) {
      console.log(error);
    }
  }

  getCurUser(): void {
    try {
      this.account
        .get()
        .then((res) => {
          this.user = res;
          localStorage.setItem("userInfo", JSON.stringify(this.user));
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  }

  emailSignUp(name: string, email: string, password: string): void {
    try {
      this.account.create(ID.unique(), email, password, name);
    } catch (error) {
      console.log(error);
    }
  }

  emailLogin(email: string, password: string): Promise<Models.Session> {
    return this.account.createEmailSession(email, password);
  }

  signOut(id: string): boolean {
    try {
      this.account.deleteSession(id);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  magicUrlLogin(email: string): void {
    this.account.createMagicURLSession(
      ID.unique(),
      email,
      `${process.env.NEXT_PUBLIC_APPURL}/login/sucess`
    );
    this.getCurUser();
  }

  createEvent(
    eventname: string,
    description: string,
    banner: File,
    hostname: string,
    eventdate: string,
    email: string,
    country: string,
    address: string,
    city: string,
    state: string,
    postal: string,
    audience: string,
    type: string,
    attendees: number,
    price: number,
    tech: string,
    agenda: string,
    sponsor: Sponsors[],
    approval: string,
    twitter: string,
    website: string,
    linkedin: string,
    instagram: string
  ): Promise<String> {
    try {
      this.storage
        .createFile(this.bannerBucketId, ID.unique(), banner)
        .then((res) => {
          this.databases
            .createDocument(this.databaseId, this.activeCollId, ID.unique(), {
              eventname: eventname,
              description: description,
              url: `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${this.bannerBucketId}/files/${res.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECTID}&mode=admin`,
              hostname: hostname,
              eventdate: eventdate,
              email: email,
              country: country,
              address: address,
              city: city,
              state: state,
              postal: postal,
              audience: audience,
              type: type,
              attendees: attendees,
              price: price,
              tech: tech,
              agenda: agenda,
              approval: approval,
              created: JSON.parse(localStorage.getItem("userInfo") || "{}").$id,
              twitter: twitter,
              website: website,
              linkedin: linkedin,
              instagram: instagram,
              registrations: [],
            })
            .then(async (res) => {
              try {
                // Ask server to create collections and sponsor docs (server uses node-appwrite)
                await fetch('/api/admin/create-collections', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    eventId: res.$id,
                    eventName: eventname,
                    sponsor: sponsor,
                    userId: JSON.parse(localStorage.getItem('userInfo') || '{}').$id,
                  }),
                });
              } catch (err) {
                console.error('Failed to request server to create collections', err);
              }
              return Promise.resolve('sucess');
            });
        });
    } catch (error) {
      console.log("error block 1");
      throw error;
    }
    return Promise.resolve("sucess");
  }
}

export {AppwriteConfig, ServerConfig};
