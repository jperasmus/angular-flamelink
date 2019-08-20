
// Flamelink app is always required
import flamelink from 'flamelink/app';
// Add additional modules that you want to use
import 'flamelink/cf/content';
import 'flamelink/cf/storage';
import 'flamelink/cf/settings';
import 'flamelink/cf/navigation'
import 'flamelink/cf/users';

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

	public app: _flamelink.app.App;

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
					} else {
						let single = !!options.entryId;
						if (data && data._fl_meta_) {
							if (data._fl_meta_.schemaType === 'single') {
								single = true;
							}
						}

						let parsedData = single ? null : [];
						if (data) {
							parsedData = single ? data : Object.keys(data).map(i => data[i]);
						}

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


