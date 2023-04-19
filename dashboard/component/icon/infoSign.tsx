import Icon from "./icon";

const data = [
	"M8,0C3.58,0,0,3.58,0,8s3.58,8,8,8s8-3.58,8-8S12.42,0,8,0z M7,3h2v2H7V3zM10,13H6v-1h1V7H6V6h3v6h1V13z",
];
export default function InfoSign() {
	return <Icon data={data} />;
}
