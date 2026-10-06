import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addvideotoPlaylist, createPlaylist, deletePlaylist, getplaylistByid, getuserPlaylists, removevideofromPlaylist, updatePlaylist } from '../controllers/playlist.controllers.js';

const router = Router();

router.use(verifyJWT);
router.route("/").post(createPlaylist)

router.route("/:playlistId")
.get(getplaylistByid)
.patch(updatePlaylist)
.delete(deletePlaylist)

router.route("/add/:videoId/:playlistId").patch(addvideotoPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removevideofromPlaylist)

router.route("/user/:userId").get(getuserPlaylists)
export default router