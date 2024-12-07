//will actively process request to find conflict and so
class PageGenerator{
    public PageGenerator(){

    }
    public timeline(String id){
        //logic to get timeline from database
        data = "xyz"
        int start_date = 20240312;
        int end_date = 20240715;
        // int [][] occupancy = new int[end_date-start_date + 1][5] ;

        int [] prev_date1 = new int[10];
        int [] prev_date2 = new int[10];
        int prev_date1[0] = start_date -1;
        int prev_date2[0] = start_date;
        byte current_layer = 0;
        elements = ""
        while(data.next()){
            s_date = data.getInt("start_date");
            e_date = data.getInt("end_date");
            for(int i=0; i<10; i++){
                if(s_date>=prev_date2[i]){
                    prev_date2 = e_date;
                    byte row_start = i + 2;
                    byte row_end = i + 3;
                    byte column_start = start_date - s_date + 1;
                    byte column_end = column_start + 1 + (e_date - s_date);
                    break;
                }
            }
        }
    }

}