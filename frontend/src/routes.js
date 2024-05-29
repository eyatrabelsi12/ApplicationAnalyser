import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
 
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ForgotPassword from 'layouts/authentication/forgot';
import HistoryIcon from '@mui/icons-material/History';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import Automated from "layouts/profile/automated";
import ResetPassword from "layouts/authentication/reset-password";
 
 
 
 
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
 
// @mui icons
import Icon from "@mui/material/Icon";
import HistoriquePage from "layouts/notifications/historique";
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import Pipeline from "layouts/pipeline";
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import Add_Role from "layouts/billing/components/Bill";
// Suppose you have a function to get the current user's role
import { getUserRole } from "utils/authUtils";
 
const userRole = getUserRole();
 
const routes = [
  {
    type: '',
    name: '',
    key: 'forgot-password', // Clé unique pour la route ForgotPassword
    icon: <Icon fontSize="small">lock</Icon>, // Utilisez une icône appropriée pour ForgotPassword
    route: '/authentication/forgot', // Chemin de la route
    component: <ForgotPassword />, // Composant pour la route ForgotPassword
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Import File ",
    key: "Import",
    icon: <Icon fontSize="small">attach_file</Icon>, // Changed icon to attach_file
    route: "/Import",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "Compare",
    key: "Compare",
    icon: <Icon fontSize="small">compare_arrows</Icon>, // Changed icon to compare_arrows
    route: "/Compare",
    component: <Tables />,
  },
  {
    type: "",
    name: "",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "",
    name: "",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
  {
    type: "collapse",
    name: "OverView",
    key:"OverView",
    icon: <Icon fontSize="small"><HistoryIcon /></Icon>,
    route: "/OverView",
    component: <HistoriquePage />,
  },
  {
    type: "collapse",
    name: "KPIs",
    key: "KPIs",
    icon: <Icon fontSize="small"><SportsSoccerIcon /></Icon>,
    route: "/KPIs",
    component: <Automated />,
    roles: ["admin"],
  },
  {
    type: "collapse",
    name: "Management Suite",
    key: "Management-Suite",
    icon: <Icon fontSize="small"><PlaylistAddIcon /></Icon>,
    route: "/Management-Suite",
    component: <Pipeline />,
    roles: ["admin"],
  },
  {
    type: "collapse",
    name: "Change Role",
    key: "Change-Role",
    icon: <Icon fontSize="small"><AdminPanelSettingsOutlinedIcon /></Icon>,
    route: "/Change-Role",
    component: <Add_Role />,
    roles: ["admin"],
  },
  {
    type: "collapse",
    name: "Sign-out",
    key: "sign-out",
    icon: <Icon fontSize="small"><ExitToAppIcon /></Icon>,
    route: "/authentication/sign-out",
    component: <SignIn />, // Rediriger vers la page de connexion lors de la déconnexion
  },
  {
    type: '',
    name: '',
    key: 'reset-password',
    icon: <Icon fontSize="small">refresh</Icon>,
    route: '/reset-password/:token',
    component: <ResetPassword />,
  },
];
 
export default routes;