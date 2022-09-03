import {
  AiOutlineLogout,
  AiOutlineShareAlt,
  AiOutlineLink
} from "react-icons/ai"
import {
  IoMic,
  IoMicOff,
  IoChatboxOutline,
  IoVideocamSharp,
  IoVideocamOff
} from "react-icons/io5"
import { BsPin, BsPinFill } from "react-icons/bs"
import { VscTriangleDown } from "react-icons/vsc"
import { FaUserAlt } from "react-icons/fa"
import { FiSend } from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"
import { MdClear, MdOutlineContentCopy, MdScreenShare } from "react-icons/md"

export const LogOutIcon = () => <AiOutlineLogout />
export const PinActiveIcon = () => <BsPinFill />
export const PinIcon = () => <BsPin />
export const ChatIcon = () => <IoChatboxOutline />
export const DownIcon = () => <VscTriangleDown />
export const UsersIcon = () => <FaUserAlt />
export const SendIcon = () => <FiSend />
export const GoogleIcon = () => <FcGoogle />
export const ClearIcon = () => <MdClear />
export const LinkIcon = () => <AiOutlineLink />
export const CopyToClipboardIcon = () => <MdOutlineContentCopy />
export const ScreenShareIcon = () => <MdScreenShare />
export const VideoOnIcon = () => <IoVideocamSharp />
export const VideoOffIcon = () => <IoVideocamOff />
export const ShareIcon = () => <AiOutlineShareAlt />
export const MicOnIcon = () => <IoMic />
export const MicOffIcon = () => <IoMicOff />
