
// Flamelink app is always required
import * as _flamelink from 'flamelink';
const flamelink = _flamelink;
// Add additional modules that you want to use
// import 'flamelink/content';
// import 'flamelink/storage';
// import 'flamelink/settings'
// import 'flamelink/navigation'
// import 'flamelink/users'

import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CF } from '@flamelink/sdk-content-types';

interface GetOptionsSingle extends CF.Get {
	entryId: string;
}

interface GetOptionsMultiple extends CF.Get {
	entryId?: null;
}

@Injectable({
	providedIn: 'root'
})
export class AngularFlamelink {

	public app: _flamelink.App;

	constructor(
		public angularFire: AngularFirestore,
		private angularAuth: AngularFireAuth
	) {
		this.app = flamelink({
			firebaseApp: this.angularFire.firestore.app,
			env: 'production', // optional, defaults to `production`
			locale: 'en-US', // optional, defaults to `en-US`
			dbType: 'cf' // optional, defaults to `rtdb` - can be 'rtdb' or 'cf' (Real-time DB vs Cloud Firestore)
		});

	}

	public valueChanges<DocumentType>(options: GetOptionsSingle): Observable<DocumentType>;
	public valueChanges<DocumentType>(options: GetOptionsMultiple): Observable<DocumentType[]>;
	public valueChanges<DocumentType>(options: CF.Get): Observable<DocumentType[]> {
		return new Observable<DocumentType[]>(subscriber => {
			this.content.subscribe({
				...options,
				callback: (error, data) => {
					if (options.callback) {
						options.callback(error, data);
					}
					if (error) {
						subscriber.error(error);
					} else if (data) {
						let single = !!options.entryId;
						if (data._fl_meta_) {
							if (data._fl_meta_.schemaType === 'single') {
								single = true;
							}
						}
						const parsedData = single ? data : Object.keys(data).map(i => data[i]);
						subscriber.next(parsedData);
					}
				}
			});
		});
	}


	public ref(id: string) {
		return this.angularFire.collection('fl_content').doc(id).ref;
	}

	public get auth() {
		return this.angularAuth;
	}

	public get content() {
		return this.app.content;
	}


	public get nav() {
		return this.app.nav;
	}

	public get schemas() {
		return this.app.schemas;
	}

	public get settings() {
		return this.app.settings;
	}

	public get storage() {
		return this.app.storage;
	}

	public get users() {
		return this.app.users;
	}


}


