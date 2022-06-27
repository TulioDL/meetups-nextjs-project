import { Fragment } from "react";
import Head from "next/head";
import { MongoClient } from "mongodb"; //his will not be included in the client side bundle because is only used in getStaticProps

import MeetupList from "../components/meetups/MeetupList";

const HomePage = (props) => {
    return (
        <Fragment>
            <Head>
                <title>React Meetups</title>
                <meta
                    name="description"
                    content="Browse a huge list of highly active React meetups"
                />
            </Head>
            <MeetupList meetups={props.meetups} />
        </Fragment>
    );
};

// export const getServerSideProps = async (context) => {
//     //the difference with getStaticProps is that this function will not run during the build process, but server side after deploymment
//     //here we can perform operations that uses credentials that cant be exposed to the user
//     //Will run for every incoming request, so doesnt accept 'revalidate' as a key in the returning object
//     //We can also work with the response and the request thanks to the context parameter (checking cookies, sessions and so on)
//     //This is the better choice if we have multiple requests from the server every second and if we need re response and the request
//     //data everytime
//     const req = context.req;
//     const res = context.res;

//     //fetch data from API

//     return {
//         props: {
//             meetups: DUMMY_MEETUPS
//         }
//     }
// }

export const getStaticProps = async () => {
    //STATIC GENERATION
    //this function is pre-made by NextJS, so we HAVE to name it like that
    //this allow us to pre-render the data we want to load on the app,
    //in a normal 'useEffect rendering' we get the data in the SECOND rendering of the page,
    //with this, we assure the optimization of the Search Engine on the page, witch will help us
    //a lot when we deploy our page.
    //And we can no longer use useState nor useEffect to fetch our data, and pass the data
    //through props
    //This is better used in pages that doenst need multiple requests every second, and faster pages

    //fetch data from the server

    //is safe to put credentials here because NextJS will hide these functions

    const client = await MongoClient.connect(
        "mongodb+srv://tuliodl:18549750@cluster0.qaco1.mongodb.net/meetups?retryWrites=true&w=majority"
    );

    const db = client.db();

    const meetupsCollection = db.collection("meetups");

    const meetups = await meetupsCollection.find().toArray();

    client.close();

    return {
        props: {
            meetups: meetups.map((meetup) => ({
                //this map is made because the id we retrive from the server is an object we have to convert to string
                title: meetup.title,
                address: meetup.address,
                image: meetup.image,
                id: meetup._id.toString(),
            })),
        },
        revalidate: 3600, //this will trigger a function in nextjs that, in this number of seconds, the page will be regenerated if there
        //is an incoming request. We can use this if our data in the server change frecuently, so we get updated info
    };
};

export default HomePage;