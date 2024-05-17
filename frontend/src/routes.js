
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
    name: "Comparer",
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
    name: "Historique",
    key:"historique",
    icon: <Icon fontSize="small"><HistoryIcon /></Icon>,
    route: "/historique",
    component: <HistoriquePage />,
  },
  {
    type: "collapse",
    name: "Automated",
    key: "Automated",
    icon: <Icon fontSize="small"><SportsSoccerIcon /></Icon>, 
    route: "/Automated",
    component: <Automated />,
  },
  {
    type: "collapse",
    name: "ManagementSuite",
    key: "ManagementSuite",
    icon: <Icon fontSize="small"><PlaylistAddIcon /></Icon>, 
    route: "/ManagementSuite",
    component: <Pipeline />,
  },
  
  {
    type: "collapse",
    name: "Sign-out",
    key: "sign-in",
    icon: <Icon fontSize="small"><ExitToAppIcon /></Icon>,
    route: "/authentication/sign-in",
    component: <SignUp />,
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
